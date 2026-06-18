import Listing from "../models/Listing.js";

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getListings(req, res) {
  const listings = await Listing.find().sort({ featured: -1, createdAt: -1 });
  res.json({ listings });
}

export async function createListing(req, res) {
  const payload = {
    ...req.body,
    slug: req.body.slug || slugify(req.body.name)
  };
  const listing = await Listing.create(payload);
  res.status(201).json({ listing });
}

export async function updateListing(req, res) {
  const updates = {
    ...req.body
  };
  if (req.body.name && !req.body.slug) {
    updates.slug = slugify(req.body.name);
  }
  const listing = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }
  res.json({ listing });
}

export async function deleteListing(req, res) {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }
  res.json({ success: true });
}
