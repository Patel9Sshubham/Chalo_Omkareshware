import Listing from "../models/Listing.js";
import Review from "../models/Review.js";

export async function getListingReviews(req, res) {
  const listing = await Listing.findOne({ slug: req.params.slug });
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  const reviews = await Review.find({ listing: listing._id, status: "approved" }).sort({ createdAt: -1 });
  res.json({ reviews, listing });
}

export async function createReview(req, res) {
  const listing = await Listing.findOne({ slug: req.params.slug });
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  const { authorName, rating, comment } = req.body;
  if (!authorName || !rating || !comment) {
    return res.status(400).json({ message: "Author name, rating and comment are required." });
  }

  const review = await Review.create({
    listing: listing._id,
    user: req.user?._id || null,
    authorName,
    rating: Number(rating),
    comment,
    status: "pending",
    source: req.user ? "user" : "guest"
  });

  res.status(201).json({ review });
}
