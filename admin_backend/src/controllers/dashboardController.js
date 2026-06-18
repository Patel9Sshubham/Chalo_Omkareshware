import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import Driver from "../models/Driver.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import SupportTicket from "../models/SupportTicket.js";
import Review from "../models/Review.js";
import { buildBookingTracking, sendWhatsAppMessage } from "../utils/messaging.js";

export async function summary(req, res) {
  const [
    users,
    bookings,
    listings,
    drivers,
    payments,
    pendingDriverApprovals,
    activeDrivers,
    hotelCount,
    restaurantCount,
    templeCount,
    pendingBookings,
    reviewCount,
    pendingReviews,
    paidPayments,
    openTickets
  ] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Booking.countDocuments(),
      Listing.countDocuments(),
      Driver.countDocuments(),
      Payment.countDocuments(),
      Driver.countDocuments({ status: "pending" }),
      Driver.countDocuments({ status: "active" }),
      Listing.countDocuments({ type: "hotel" }),
      Listing.countDocuments({ type: "restaurant" }),
      Listing.countDocuments({ type: "temple" }),
      Booking.countDocuments({ status: "pending" }),
      Review.countDocuments(),
      Review.countDocuments({ status: "pending" }),
      Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      SupportTicket.countDocuments({ status: { $in: ["open", "in_progress"] } })
    ]);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: "paid", createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  res.json({
    stats: {
      users,
      bookings,
      listings,
      drivers,
      payments,
      pendingApprovals: pendingDriverApprovals,
      activeDrivers,
      hotels: hotelCount,
      restaurants: restaurantCount,
      temples: templeCount,
      reviews: reviewCount,
      pendingReviews,
      pendingBookings,
      dailyRevenue: 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: paidPayments[0]?.total || 0,
      openTickets
    }
  });
}

export async function getUsers(req, res) {
  const users = await User.find({ role: "user" }).sort({ createdAt: -1 }).select("-password");
  res.json({ users });
}

export async function getDrivers(req, res) {
  const drivers = await Driver.find().sort({ createdAt: -1 });
  res.json({ drivers });
}

export async function getBookings(req, res) {
  const bookings = await Booking.find()
    .populate("user", "name email phone role")
    .populate("driver", "name mobile vehicleType vehicleNumber status rating")
    .sort({ createdAt: -1 });
  res.json({ bookings });
}

export async function updateBookingStatus(req, res) {
  const { status, driverId, driverName, driverContact, driverVehicleNumber } = req.body;
  const statusMap = {
    accepted: "driver_assigned",
    completed: "ride_completed",
    pending: "pending",
    driver_assigned: "driver_assigned",
    driver_reached: "driver_reached",
    ride_started: "ride_started",
    ride_completed: "ride_completed",
    payment_settled: "payment_settled",
    cancelled: "cancelled"
  };
  const normalizedStatus = statusMap[status];

  if (!normalizedStatus) {
    return res.status(400).json({ message: "Invalid booking status." });
  }

  const booking = await Booking.findById(req.params.id).populate("user", "name email phone role");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  booking.status = normalizedStatus;
  if (driverId) booking.driver = driverId;
  if (driverName) booking.driverName = driverName;
  if (driverContact) booking.driverContact = driverContact;
  if (driverVehicleNumber) booking.driverVehicleNumber = driverVehicleNumber;
  await booking.save();

  const tracking = buildBookingTracking(booking);

  await Notification.create({
    audience: "user",
    type: "booking_status_changed",
    title: "Booking Update",
    message: `Your booking ${booking.bookingId} is now ${normalizedStatus.replace(/_/g, " ")}.`,
    booking: booking._id,
    user: booking.user._id
  });

  if (booking.driverContact && ["driver_assigned", "driver_reached", "ride_started", "ride_completed"].includes(normalizedStatus)) {
    const message =
      `Ride update for ${booking.bookingId}\n` +
      `Status: ${tracking.statusLabel}\n` +
      `Pickup: ${booking.pickup}\n` +
      `Destination: ${booking.destination}\n` +
      `Route: ${tracking.routeLink}`;
    await sendWhatsAppMessage({ to: booking.driverContact, body: message });
  }

  if (booking.user?.phone && ["driver_assigned", "driver_reached", "ride_started", "ride_completed", "payment_settled"].includes(normalizedStatus)) {
    const riderMessage =
      `Your booking ${booking.bookingId} is now ${tracking.statusLabel}.\n` +
      `Driver: ${booking.driverName || "Assigned"}\n` +
      `Vehicle: ${booking.driverVehicleNumber || "Pending"}\n` +
      `Pickup: ${booking.pickup}\n` +
      `Destination: ${booking.destination}\n` +
      `Track route: ${tracking.routeLink}`;
    await sendWhatsAppMessage({ to: booking.user.phone, body: riderMessage });
  }

  res.json({ booking });
}

export async function getNotifications(req, res) {
  const notifications = await Notification.find({ audience: "admin" }).sort({ createdAt: -1 }).limit(50);
  res.json({ notifications });
}

export async function getSupportTickets(req, res) {
  const tickets = await SupportTicket.find().populate("user", "name email phone").sort({ createdAt: -1 });
  res.json({ tickets });
}

export async function updateSupportTicket(req, res) {
  const { status, adminNote = "" } = req.body;
  const allowed = ["open", "in_progress", "resolved", "closed"];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid ticket status." });
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found." });
  }

  if (status) ticket.status = status;
  if (adminNote) {
    ticket.adminNote = adminNote;
    ticket.notesHistory.push({
      note: adminNote,
      status: status || ticket.status
    });
  } else if (status) {
    ticket.notesHistory.push({
      note: `Status changed to ${status.replace(/_/g, " ")}`,
      status
    });
  }
  await ticket.save();
  res.json({ ticket });
}

export async function getPayments(req, res) {
  const payments = await Payment.find().populate("booking", "bookingId pickup destination totalAmount status").sort({ createdAt: -1 });
  res.json({ payments });
}

export async function updateDriverStatus(req, res) {
  const { status } = req.body;
  const allowed = ["pending", "under_review", "approved", "rejected", "active"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid driver status." });
  }

  const driver = await Driver.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!driver) {
    return res.status(404).json({ message: "Driver not found." });
  }

  await Notification.create({
    audience: "driver",
    type: "driver_status_changed",
    title: "Driver Verification Update",
    message: `Your application is now ${status.replace(/_/g, " ")}.`,
    driver: driver._id
  });

  res.json({ driver });
}
