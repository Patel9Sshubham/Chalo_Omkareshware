import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import BlogPost from "../models/BlogPost.js";
import PricingSetting from "../models/PricingSetting.js";

const defaultListings = [
  {
    type: "hotel",
    name: "Narmada View Hotel",
    slug: "narmada-view-hotel",
    category: "family",
    location: "Near Temple Ghat",
    address: "Temple Ghat Road, Omkareshwar",
    description: "Comfortable stay with river view.",
    longDescription: "Premium hotel stay with clean rooms, family service, and river-side location.",
    price: 1800,
    priceRange: "Rs 1500 - Rs 2500",
    numberOfRooms: 24,
    rating: 4.7,
    availabilityStatus: "available",
    contactNumber: "+91 99999 11111",
    whatsappNumber: "+91 99999 11111",
    mapsLocation: "Narmada View Hotel Omkareshwar",
    amenities: ["AC Rooms", "Parking", "WiFi", "Family Rooms", "Hot Water"],
    roomTypes: ["Standard", "Deluxe", "Family Suite"],
    nearbyAttractions: ["Omkareshwar Jyotirlinga", "Narmada Ghat"],
    gallery: ["/images/hotel-1.jpg"],
    featured: true
  },
  {
    type: "dharamshala",
    name: "Shree Krishna Dharamshala",
    slug: "shree-krishna-dharamshala",
    category: "pilgrim",
    location: "Main Market",
    address: "Main Market, Omkareshwar",
    description: "Clean and affordable pilgrim stay.",
    longDescription: "Verified pilgrim accommodation with simple rooms and temple access.",
    price: 700,
    priceRange: "Rs 500 - Rs 900",
    numberOfRooms: 30,
    rating: 4.8,
    availabilityStatus: "available",
    contactNumber: "+91 88888 11111",
    whatsappNumber: "+91 88888 11111",
    mapsLocation: "Shree Krishna Dharamshala Omkareshwar",
    facilities: ["Non-AC Rooms", "Temple Proximity", "Food Area"],
    nearbyTemples: ["Omkareshwar Jyotirlinga"],
    gallery: ["/images/dharamshala-1.jpg"],
    featured: true
  },
  {
    type: "temple",
    name: "Omkareshwar Jyotirlinga",
    slug: "omkareshwar-jyotirlinga",
    category: "jyotirlinga",
    location: "Island Temple",
    address: "Narmada Island, Omkareshwar",
    description: "Sacred temple on the Narmada river island.",
    longDescription: "One of the most important pilgrimage destinations, known for spiritual significance and river surroundings.",
    price: 0,
    priceRange: "Free",
    rating: 5,
    availabilityStatus: "open",
    mapsLocation: "Omkareshwar Jyotirlinga",
    history: "Ancient Jyotirlinga temple with deep spiritual heritage.",
    importance: "One of the 12 Jyotirlingas in India.",
    timings: "5:00 AM - 9:00 PM",
    aartiTimings: "Morning and Evening Aarti",
    nearbyHotels: ["Narmada View Hotel"],
    nearbyRestaurants: ["Narmada Bhojanalay"],
    gallery: ["/images/temple-1.jpg"],
    featured: true
  },
  {
    type: "restaurant",
    name: "Narmada Bhojanalay",
    slug: "narmada-bhojanalay",
    category: "vegetarian",
    location: "Bus Stand Road",
    address: "Bus Stand Road, Omkareshwar",
    description: "Simple vegetarian meals and local thali.",
    longDescription: "Popular food stop for pilgrims with fresh vegetarian meals and quick service.",
    price: 250,
    averageCost: "Rs 120 - Rs 300",
    cuisineType: "Vegetarian",
    openingTime: "7:00 AM",
    closingTime: "10:00 PM",
    rating: 4.6,
    availabilityStatus: "open",
    contactNumber: "+91 77777 11111",
    whatsappNumber: "+91 77777 11111",
    mapsLocation: "Narmada Bhojanalay Omkareshwar",
    menuHighlights: ["Thali", "Poha", "Tea", "Snacks"],
    nearbyTemples: ["Omkareshwar Jyotirlinga"],
    nearbyHotels: ["Narmada View Hotel"],
    gallery: ["/images/restaurant-1.jpg"],
    featured: true
  },
  {
    type: "route",
    name: "Indore to Omkareshwar",
    slug: "indore-to-omkareshwar",
    location: "Intercity Route",
    description: "Popular direct travel route for pilgrims and tourists.",
    price: 200,
    rating: 4.8,
    featured: true
  },
  {
    type: "service",
    name: "Local Ride Booking",
    slug: "local-ride-booking",
    location: "Omkareshwar Circle",
    description: "Book bike, auto, cab, or traveller rides.",
    price: 150,
    rating: 4.9,
    featured: true
  }
];

const defaultBlogs = [
  {
    slug: "best-hotels-near-omkareshwar-temple",
    title: "Best Hotels Near Omkareshwar Temple",
    category: "Hotel Recommendations",
    excerpt: "Find comfortable hotel stays near the temple and river-side points.",
    content: "Choose hotels near the temple ghat if you want quick access, family-friendly service and shorter commute time.",
    coverImage: "",
    tags: ["hotel", "omkareshwar", "travel"],
    seoTitle: "Best Hotels Near Omkareshwar Temple",
    seoDescription: "SEO guide to the best hotels near Omkareshwar temple.",
    published: true,
    featured: true
  },
  {
    slug: "complete-omkareshwar-travel-guide",
    title: "Complete Omkareshwar Travel Guide",
    category: "Travel Guides",
    excerpt: "Plan routes, transport and sightseeing in one guide.",
    content: "Start early, keep cash and digital payment ready, and use the ride booking system for last-mile movement.",
    coverImage: "",
    tags: ["guide", "travel", "omkareshwar"],
    seoTitle: "Complete Omkareshwar Travel Guide",
    seoDescription: "Travel guide for pilgrims and tourists visiting Omkareshwar.",
    published: true,
    featured: true
  },
  {
    slug: "temple-timings-in-omkareshwar",
    title: "Temple Timings in Omkareshwar",
    category: "Temple Information",
    excerpt: "Useful timing overview for pilgrims visiting Omkareshwar.",
    content: "Morning darshan, aarti windows and festival timings can change seasonally, so always verify on the detail page.",
    coverImage: "",
    tags: ["temple", "timings"],
    seoTitle: "Temple Timings in Omkareshwar",
    seoDescription: "Latest temple timings overview for Omkareshwar visitors.",
    published: true,
    featured: true
  }
];

export async function seedInitialData() {
  if ((await User.countDocuments({ role: "admin" })) === 0) {
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@12345", 10);
    await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email: (process.env.ADMIN_EMAIL || "admin@chaloomkareshwar.com").toLowerCase(),
      phone: "",
      password: adminPassword,
      role: "admin"
    });
  }

  if ((await Listing.countDocuments()) === 0) {
    await Listing.insertMany(defaultListings);
  }

  if ((await PricingSetting.countDocuments({ key: "default" })) === 0) {
    await PricingSetting.create({
      key: "default",
      currency: "inr",
      taxesPercent: 5,
      baseFares: { bike: 20, auto: 30, cab: 50, traveller: 120 },
      perKmRates: { bike: 6, auto: 10, cab: 14, traveller: 24 },
      convenienceFees: { bike: 10, auto: 20, cab: 30, traveller: 50 },
      etaMinutes: { bike: 5, auto: 7, cab: 10, traveller: 15 }
    });
  }

  if ((await BlogPost.countDocuments()) === 0) {
    await BlogPost.insertMany(defaultBlogs);
  }
}
