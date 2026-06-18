import Listing from "../models/Listing.js";

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getHomeData(req, res) {
  const listings = await Listing.find().sort({ featured: -1, createdAt: -1 });
  const featured = listings.filter((item) => item.featured);
  const byType = listings.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  res.json({
    featured,
    byType,
    popularRoutes: byType.route || [],
    categories: [
      { title: "Ride Booking", key: "service" },
      { title: "Hotels", key: "hotel" },
      { title: "Dharamshalas", key: "dharamshala" },
      { title: "Temples", key: "temple" },
      { title: "Restaurants", key: "restaurant" },
      { title: "Travel Guide", key: "guide" },
      { title: "Attractions", key: "attraction" }
    ]
  });
}

export async function getListings(req, res) {
  const { type } = req.query;
  const filter = type ? { type } : {};
  const listings = await Listing.find(filter).sort({ featured: -1, createdAt: -1 });
  res.json({ listings });
}

export async function getListingBySlug(req, res) {
  const listing = await Listing.findOne({ slug: req.params.slug });
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  const related = await Listing.find({
    type: listing.type,
    _id: { $ne: listing._id }
  })
    .sort({ featured: -1, rating: -1 })
    .limit(4);

  res.json({
    listing,
    related,
    seo: {
      title: listing.metaTitle || `${listing.name} | Chalo Omkareshwar`,
      description: listing.metaDescription || listing.description || listing.longDescription || ""
    }
  });
}

export async function getTravelGuide(req, res) {
  res.json({
    sections: [
      {
        key: "about",
        title: "About Omkareshwar",
        text: "Omkareshwar is a sacred pilgrimage destination on the Narmada river with a strong spiritual and local travel ecosystem."
      },
      {
        key: "history",
        title: "History",
        text: "The island temple region is known for its deep religious heritage, river-side ghats and connected local markets."
      },
      {
        key: "culture",
        title: "Culture",
        text: "Pilgrimage, local food, ghats, temple visits and family travel shape the unique movement patterns here."
      },
      {
        key: "transport",
        title: "Local Transportation",
        text: "Use ride booking for bike, auto, cab and traveller travel across Omkareshwar, Mortakka, Sanawad and nearby places."
      },
      {
        key: "emergency",
        title: "Emergency Contacts",
        text: "Keep local support numbers, driver contact and hotel assistance handy during peak travel hours."
      }
    ]
  });
}

export async function getAttractions(req, res) {
  const attractions = await Listing.find({ type: { $in: ["temple", "service", "route"] } }).sort({ featured: -1, rating: -1 });
  res.json({ attractions });
}
