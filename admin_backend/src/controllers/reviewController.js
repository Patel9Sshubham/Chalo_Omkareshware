import Review from "../models/Review.js";

export async function getReviews(req, res) {
  const reviews = await Review.find().populate("listing", "name slug type").sort({ createdAt: -1 });
  res.json({ reviews });
}

export async function updateReview(req, res) {
  const { status, adminReply = "" } = req.body;
  const allowed = ["pending", "approved", "rejected"];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid review status." });
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  if (status) review.status = status;
  if (adminReply !== undefined) review.adminReply = adminReply;
  await review.save();
  res.json({ review });
}

export async function deleteReview(req, res) {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }
  res.json({ success: true });
}
