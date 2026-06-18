import crypto from "crypto";
import Razorpay from "razorpay";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in backend/.env");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

function getCurrency() {
  return (process.env.PAYMENT_CURRENCY || "INR").toUpperCase();
}

async function syncBookingPaymentSuccess(booking, paymentId, orderId, signature) {
  booking.paymentStatus = "paid";
  booking.status = "driver_assigned";
  await booking.save();

  const payment = await Payment.findOneAndUpdate(
    { bookingId: booking.bookingId },
    {
      booking: booking._id,
      bookingId: booking.bookingId,
      user: booking.user,
      amount: booking.totalAmount,
      paymentMethod: "razorpay",
      provider: "razorpay",
      status: "paid",
      transactionId: paymentId,
      currency: getCurrency(),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Notification.create({
    audience: "user",
    type: "payment_success",
    title: "Payment Successful",
    message: `Payment for booking ${booking.bookingId} was completed.`,
    booking: booking._id,
    user: booking.user
  });

  await Notification.create({
    audience: "admin",
    type: "payment_success",
    title: "Payment Successful",
    message: `Booking ${booking.bookingId} payment completed.`,
    booking: booking._id,
    user: booking.user
  });

  return payment;
}

export async function createRazorpayOrder(req, res) {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ message: "bookingId is required." });
  }

  const booking = await Booking.findOne({ bookingId }).populate("user", "name email phone");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const razorpay = getRazorpayClient();
  const amount = Math.round(Number(booking.totalAmount || 0) * 100);

  if (!amount || amount < 100) {
    return res.status(400).json({ message: "Invalid booking amount." });
  }

  const order = await razorpay.orders.create({
    amount,
    currency: getCurrency(),
    receipt: booking.bookingId,
    notes: {
      bookingId: booking.bookingId,
      userId: String(booking.user._id)
    }
  });

  await Payment.findOneAndUpdate(
    { bookingId: booking.bookingId },
    {
      booking: booking._id,
      bookingId: booking.bookingId,
      user: booking.user._id,
      amount: booking.totalAmount,
      paymentMethod: "razorpay",
      provider: "razorpay",
      status: "pending",
      currency: getCurrency(),
      razorpayOrderId: order.id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    booking: {
      bookingId: booking.bookingId,
      totalAmount: booking.totalAmount,
      pickup: booking.pickup,
      destination: booking.destination,
      user: {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone
      }
    }
  });
}

export async function verifyRazorpayPayment(req, res) {
  const {
    bookingId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature
  } = req.body;

  if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: "Missing Razorpay payment details." });
  }

  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: "Invalid payment signature." });
  }

  await syncBookingPaymentSuccess(booking, razorpayPaymentId, razorpayOrderId, razorpaySignature);

  res.json({ success: true });
}

export async function getMyPayments(req, res) {
  const payments = await Payment.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("booking", "bookingId pickup destination totalAmount");
  res.json({ payments });
}
