import Driver from "../models/Driver.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";

function buildDriverToken(driverId) {
  return jwt.sign({ id: driverId, role: "driver" }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function applyDriver(req, res) {
  const {
    name,
    mobile,
    email,
    address,
    vehicleType,
    vehicleNumber,
    licenseNumber,
    aadharNumber,
    experienceYears,
    documents = {}
  } = req.body;

  if (!name || !mobile || !email || !vehicleType || !vehicleNumber || !licenseNumber || !aadharNumber) {
    return res.status(400).json({ message: "All driver fields are required." });
  }

  const driver = await Driver.create({
    name,
    mobile,
    email,
    address: address || "",
    vehicleType,
    vehicleNumber,
    licenseNumber,
    aadharNumber,
    experienceYears: Number(experienceYears || 0),
    documents: {
      driverPhoto: documents.driverPhoto || "",
      licenseCopy: documents.licenseCopy || "",
      rcBook: documents.rcBook || "",
      aadharCard: documents.aadharCard || "",
      vehiclePhoto: documents.vehiclePhoto || "",
      insuranceCopy: documents.insuranceCopy || ""
    },
    status: "pending",
    user: req.user?._id || null
  });

  await Notification.create({
    audience: "admin",
    type: "new_driver_registration",
    title: "New Driver Registration",
    message: `${driver.name} submitted a driver application.`,
    driver: driver._id,
    user: req.user?._id || null
  });

  res.status(201).json({ driver });
}

export async function getMyDriverProfile(req, res) {
  const driver = await Driver.findOne({ user: req.user._id });
  res.json({ driver });
}

export async function loginDriver(req, res) {
  const { mobile, licenseNumber } = req.body;
  if (!mobile || !licenseNumber) {
    return res.status(400).json({ message: "Mobile and license number are required." });
  }

  const driver = await Driver.findOne({ mobile, licenseNumber });
  if (!driver) {
    return res.status(401).json({ message: "Driver not found." });
  }

  if (!["approved", "active", "under_review", "pending"].includes(driver.status)) {
    return res.status(403).json({ message: "Driver access is not available." });
  }

  const token = buildDriverToken(driver._id);
  res.json({
    token,
    driver: {
      id: driver._id,
      name: driver.name,
      mobile: driver.mobile,
      email: driver.email,
      vehicleType: driver.vehicleType,
      vehicleNumber: driver.vehicleNumber,
      status: driver.status,
      rating: driver.rating,
      totalRides: driver.totalRides,
      earnings: driver.earnings
    }
  });
}

export async function getDriverDashboard(req, res) {
  const driver = req.driver;
  const bookings = await Booking.find({ driver: driver._id })
    .populate("user", "name phone email")
    .sort({ createdAt: -1 });

  const activeBookings = bookings.filter((booking) => ["pending", "driver_assigned", "driver_reached", "ride_started"].includes(booking.status));
  const completedBookings = bookings.filter((booking) => booking.status === "ride_completed" || booking.status === "payment_settled");

  const stats = {
    todaysEarnings: completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
    weeklyEarnings: bookings.slice(0, 7).reduce((sum, booking) => sum + booking.totalAmount, 0),
    monthlyEarnings: bookings.slice(0, 30).reduce((sum, booking) => sum + booking.totalAmount, 0),
    totalEarnings: driver.earnings || 0,
    activeRequests: activeBookings.length,
    completedRides: completedBookings.length,
    avgRating: driver.rating || 0
  };

  res.json({ driver, bookings, stats });
}

export async function respondToBooking(req, res) {
  const { decision } = req.body;
  const allowed = ["accept", "reject"];
  if (!allowed.includes(decision)) {
    return res.status(400).json({ message: "Invalid decision." });
  }

  const booking = await Booking.findOne({ _id: req.params.id, driver: req.driver._id }).populate("user", "name phone email");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  if (decision === "accept") {
    booking.status = "driver_assigned";
    booking.driverName = req.driver.name;
    booking.driverContact = req.driver.mobile;
    booking.driverVehicleNumber = req.driver.vehicleNumber;
  } else {
    booking.status = "pending";
    booking.driver = null;
    booking.driverName = "";
    booking.driverContact = "";
    booking.driverVehicleNumber = "";
  }

  await booking.save();

  await Notification.create({
    audience: "user",
    type: "driver_response",
    title: decision === "accept" ? "Driver Assigned" : "Driver Rejected Booking",
    message: decision === "accept"
      ? `Driver ${req.driver.name} accepted booking ${booking.bookingId}.`
      : `Driver rejected booking ${booking.bookingId}.`,
    booking: booking._id,
    user: booking.user._id,
    driver: req.driver._id
  });

  await Notification.create({
    audience: "driver",
    type: "driver_booking_action",
    title: "Booking Response Saved",
    message: `You ${decision === "accept" ? "accepted" : "rejected"} booking ${booking.bookingId}.`,
    booking: booking._id,
    driver: req.driver._id
  });

  res.json({ booking });
}

export async function getDriverBookings(req, res) {
  const bookings = await Booking.find({ driver: req.driver._id }).sort({ createdAt: -1 }).populate("user", "name phone email");
  res.json({ bookings });
}
