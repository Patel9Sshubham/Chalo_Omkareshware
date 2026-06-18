import Listing from "../models/Listing.js";

const landingPages = {
  "indore-to-omkareshwar-cab": {
    title: "Indore to Omkareshwar Cab Booking",
    description: "Book reliable Indore to Omkareshwar cab service with transparent pricing and quick driver assignment.",
    listingType: "route",
    hero: "Comfortable intercity travel from Indore to Omkareshwar"
  },
  "cheap-hotels-in-omkareshwar": {
    title: "Cheap Hotels in Omkareshwar",
    description: "Find budget-friendly hotels and pilgrim stays in Omkareshwar with directions and contact options.",
    listingType: "hotel",
    hero: "Affordable stays for pilgrims and tourists"
  },
  "best-dharamshala-in-omkareshwar": {
    title: "Best Dharamshala in Omkareshwar",
    description: "Verified dharamshala listings for comfortable and affordable spiritual stays.",
    listingType: "dharamshala",
    hero: "Trusted pilgrim accommodation"
  },
  "restaurants-near-omkareshwar-temple": {
    title: "Restaurants Near Omkareshwar Temple",
    description: "Discover restaurants and dhabas near Omkareshwar temple with food timings and directions.",
    listingType: "restaurant",
    hero: "Food options near the temple"
  }
};

export async function getLandingPage(req, res) {
  const page = landingPages[req.params.slug];
  if (!page) {
    return res.status(404).json({ message: "Landing page not found." });
  }

  const listings = await Listing.find({ type: page.listingType }).sort({ featured: -1, rating: -1 }).limit(8);
  res.json({
    page: {
      ...page,
      slug: req.params.slug
    },
    listings,
    seo: {
      title: page.title,
      description: page.description
    }
  });
}

export async function getLandingPages(req, res) {
  res.json({
    pages: Object.entries(landingPages).map(([slug, page]) => ({ slug, ...page }))
  });
}
