import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import Driver from "../models/Driver.js";
import { estimateRoute, buildBookingId } from "../utils/bookingMath.js";
import { buildBookingTracking, sendWhatsAppMessage } from "../utils/messaging.js";

function buildTimeStampParts(date = new Date()) {
  return {
    bookingDate: date.toLocaleDateString("en-IN"),
    bookingTime: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  };
}

export async function createBooking(req, res) {
  const {
    pickup,
    destination,
    vehicleType,
    notes = "",
    paymentMethod = "cash"
  } = req.body;

  if (!pickup || !destination || !vehicleType) {
    return res.status(400).json({ message: "Pickup, destination and vehicle type are required." });
  }

  const route = await estimateRoute(pickup, destination, vehicleType);
  const nextCount = (await Booking.countDocuments()) + 1;
  const bookingId = buildBookingId(nextCount);
  const { bookingDate, bookingTime } = buildTimeStampParts();
  const paymentStatus = paymentMethod === "cash" ? "pending" : "pending";

  const booking = await Booking.create({
    bookingId,
    user: req.user._id,
    pickup,
    destination,
    vehicleType,
    routeName: route.routeName,
    distanceKm: route.distanceKm,
    estimatedTimeMinutes: route.timeMinutes,
    bookingDate,
    bookingTime,
    notes,
    baseFare: route.baseFare,
    distanceFare: route.distanceFare,
    convenienceFee: route.convenienceFee,
    taxes: route.taxes,
    totalAmount: route.totalAmount,
    paymentMethod,
    paymentStatus,
    status: "pending"
  });

  await Payment.create({
    booking: booking._id,
    bookingId,
    user: req.user._id,
    amount: route.totalAmount,
    paymentMethod,
    status: "pending",
    currency: process.env.PAYMENT_CURRENCY || "inr",
    provider: process.env.PAYMENT_PROVIDER || "razorpay"
  });

  await Notification.create({
    audience: "admin",
    type: "new_booking",
    title: "New Booking",
    message: `New booking received for ${booking.pickup} to ${booking.destination}.`,
    booking: booking._id,
    user: req.user._id
  });

  const matchingDriver = await Driver.findOne({
    status: { $in: ["approved", "active"] },
    vehicleType
  }).sort({ rating: -1, totalRides: 1 });

  if (matchingDriver) {
    booking.driver = matchingDriver._id;
    booking.status = "driver_assigned";
    await booking.save();

    const tracking = buildBookingTracking(booking);
    const driverMessage =
      `NEW RIDE REQUEST\n` +
      `Booking ID: ${booking.bookingId}\n` +
      `Pickup: ${booking.pickup}\n` +
      `Destination: ${booking.destination}\n` +
      `Fare: Rs ${booking.totalAmount}\n` +
      `Customer: ${req.user.phone || req.user.email}\n` +
      `Pickup Map: ${tracking.pickupLink}\n` +
      `Route Map: ${tracking.routeLink}\n` +
      `Accept this booking from the admin dashboard or driver dashboard.`;

    await Notification.create({
      audience: "driver",
      type: "new_booking_request",
      title: "New Ride Request",
      message: `Booking ${booking.bookingId} is waiting for your response.`,
      booking: booking._id,
      user: req.user._id,
      driver: matchingDriver._id
    });

    if (matchingDriver.mobile) {
      await sendWhatsAppMessage({ to: matchingDriver.mobile, body: driverMessage });
    }
  }

  res.status(201).json({ booking });
}

export async function estimateBooking(req, res) {
  const { pickup, destination, vehicleType = "cab" } = req.body;
  if (!pickup || !destination) {
    return res.status(400).json({ message: "Pickup and destination are required." });
  }

  const route = await estimateRoute(pickup, destination, vehicleType);
  res.json({ estimate: route });
}

export async function getMyBookings(req, res) {
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("driver", "name mobile vehicleType vehicleNumber rating");

  res.json({ bookings });
}

export async function cancelBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  if (booking.status === "driver_assigned" || booking.status === "driver_reached" || booking.status === "ride_started") {
    booking.cancellationFee = Math.max(20, Math.round(booking.totalAmount * 0.15));
  }

  booking.status = "cancelled";
  booking.paymentStatus = booking.paymentMethod === "cash" ? "pending" : booking.paymentStatus;
  await booking.save();

  await Notification.create({
    audience: "user",
    type: "booking_cancelled",
    title: "Booking Cancelled",
    message: `Your booking ${booking.bookingId} has been cancelled.`,
    booking: booking._id,
    user: req.user._id
  });

  res.json({ booking });
}

export async function getBookingDetails(req, res) {
  const booking = await Booking.findOne({ bookingId: req.params.bookingId, user: req.user._id })
    .populate("driver", "name mobile vehicleType vehicleNumber rating")
    .populate("user", "name email phone");

  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const tracking = buildBookingTracking(booking);
  const statusFlow = [
    { key: "pending", label: "Booking Created" },
    { key: "driver_assigned", label: "Driver Assigned" },
    { key: "driver_reached", label: "Driver Reached" },
    { key: "ride_started", label: "Ride Started" },
    { key: "ride_completed", label: "Ride Completed" },
    { key: "payment_settled", label: "Payment Settled" }
  ];

  res.json({
    booking,
    tracking,
    statusFlow,
    maps: {
      pickup: tracking.pickupLink,
      destination: tracking.destinationLink,
      route: tracking.routeLink
    }
  });
}

export async function getBookingFeed(req, res) {
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("driver", "name mobile vehicleType vehicleNumber rating");

  const feed = bookings.map((booking) => ({
    bookingId: booking.bookingId,
    status: booking.status,
    statusLabel: booking.status.replace(/_/g, " "),
    totalAmount: booking.totalAmount,
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    pickup: booking.pickup,
    destination: booking.destination,
    driverName: booking.driverName || booking.driver?.name || "",
    driverContact: booking.driverContact || booking.driver?.mobile || "",
    driverVehicleNumber: booking.driverVehicleNumber || booking.driver?.vehicleNumber || "",
    estimatedTimeMinutes: booking.estimatedTimeMinutes,
    distanceKm: booking.distanceKm
  }));

  res.json({ feed });
}
