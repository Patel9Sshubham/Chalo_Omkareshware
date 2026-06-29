import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "./api/client";
import driverApi from "./api/driverClient";
import { useAuth } from "./context/AuthContext";
import { useDriverAuth } from "./context/DriverAuthContext";

const MEDIA_ORIGIN =
  import.meta.env.VITE_MEDIA_ORIGIN ||
  (import.meta.env.DEV ? "http://localhost:4000" : "");

function resolveMediaSrc(src = "") {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  if (src.startsWith("/uploads/") || src.startsWith("/images/")) {
    return `${MEDIA_ORIGIN}${src}`;
  }
  return src;
}

const navGroups = [
  {
    label: "Explore",
    items: [
      { label: "Hotels", href: "/hotels" },
      { label: "Dharamshalas", href: "/dharamshalas" },
      { label: "Temples", href: "/temples" },
      { label: "Restaurants", href: "/restaurants" },
      { label: "Travel Guide", href: "/travel-guide" },
      { label: "Blog", href: "/blog" }
    ]
  },
  {
    label: "Bookings",
    items: [
      { label: "Profile", href: "/profile" },
      { label: "My Bookings", href: "/my-bookings" },
      { label: "Payments", href: "/payments" },
      { label: "Notifications", href: "/notifications" }
    ]
  },
  {
    label: "Drivers",
    items: [
      { label: "Driver Apply", href: "/driver-apply" },
      { label: "Driver Login", href: "/driver/login" },
      { label: "Become Driver", href: "/driver-apply" }
    ]
  }
];

function NavDropdown({ label, items }) {
  return (
    <div className="nav-dropdown nav-dropdown-static">
      <div className="nav-dropdown-label">{label}</div>
      <div className="nav-dropdown-menu">
        {items.map((item) => (
          <Link key={item.href} to={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ResponsiveNavMenu({ navGroups, openGroup, setOpenGroup, onNavigate, mobile = false, menuOpen = true }) {
  const closeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleToggle = (label) => {
    setOpenGroup((current) => (current === label ? "" : label));
  };

  const handleOpen = (label) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setOpenGroup(label);
  };

  const handleClose = (label) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpenGroup((current) => (current === label ? "" : current));
    }, 160);
  };

  return (
    <div className={`nav-shell ${mobile ? "mobile" : "desktop"} ${menuOpen ? "open" : ""}`}>
      <Link to="/" onClick={onNavigate}>
        Home
      </Link>
      <Link to="/dashboard" onClick={onNavigate}>
        Book Ride
      </Link>
      {navGroups.map((group) => {
        const isOpen = openGroup === group.label;
        return (
          <div
            key={group.label}
            className={`nav-dropdown ${mobile ? "mobile" : "desktop"} ${isOpen ? "open" : ""}`}
            onMouseEnter={mobile ? undefined : () => handleOpen(group.label)}
            onMouseLeave={mobile ? undefined : () => handleClose(group.label)}
          >
            <button className="nav-dropdown-trigger" type="button" onClick={() => handleToggle(group.label)}>
              {group.label}
              <span className="nav-caret">▾</span>
            </button>
            <div
              className="nav-dropdown-menu"
              onMouseEnter={mobile ? undefined : () => handleOpen(group.label)}
              onMouseLeave={mobile ? undefined : () => handleClose(group.label)}
            >
              {group.items.map((item) => (
                <Link key={item.href} to={item.href} onClick={onNavigate}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const blogPosts = [
  {
    slug: "best-hotels-near-omkareshwar-temple",
    title: "Best Hotels Near Omkareshwar Temple",
    category: "Hotel Recommendations",
    description: "A practical guide to comfortable stays near temple access and river-side points.",
    body: "Choose hotels near the temple ghat if you want quick access, family-friendly service and short travel time."
  },
  {
    slug: "complete-omkareshwar-travel-guide",
    title: "Complete Omkareshwar Travel Guide",
    category: "Travel Guides",
    description: "Plan your pilgrimage with route ideas, transport tips and must-visit places.",
    body: "Start early, keep cash and digital payment ready, and use the ride booking system for last-mile movement."
  },
  {
    slug: "temple-timings-in-omkareshwar",
    title: "Temple Timings in Omkareshwar",
    category: "Temple Information",
    description: "Useful temple timing overview for pilgrims.",
    body: "Morning darshan, aarti windows and festival timings can change seasonally, so always verify on the listing detail page."
  }
];

function WebsiteShell({ children }) {
  const { user, logout } = useAuth();
  const { driver, logout: driverLogout } = useDriverAuth();
  const [openGroup, setOpenGroup] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navWrapRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;
  const pageTitleMap = {
    "/": "Home",
    "/dashboard": "Book Ride",
    "/profile": "Profile",
    "/my-bookings": "My Bookings",
    "/payments": "Payments",
    "/notifications": "Notifications",
    "/driver-apply": "Driver Apply",
    "/driver/login": "Driver Login",
    "/hotels": "Hotels",
    "/dharamshalas": "Dharamshalas",
    "/temples": "Temples",
    "/restaurants": "Restaurants",
    "/travel-guide": "Travel Guide",
    "/blog": "Blog"
  };
  const pageTitle = pageTitleMap[location.pathname] || "Chalo Omkareshwar";

  useEffect(() => {
    const onClickOutside = (event) => {
      if (navWrapRef.current && !navWrapRef.current.contains(event.target)) {
        setOpenGroup("");
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setOpenGroup("");
    }
  }, [mobileMenuOpen]);

  const closeMenus = () => {
    setOpenGroup("");
    setMobileMenuOpen(false);
  };

  return (
    <div>
      <header className="topbar" ref={navWrapRef}>
        <div className="brand">
          <div className="brand-mark">CO</div>
          <div>
            <div className="brand-title">Chalo Omkareshwar</div>
          </div>
        </div>
        <button className="hamburger-button" type="button" onClick={() => setMobileMenuOpen((current) => !current)}>
          <span />
          <span />
          <span />
        </button>
        <nav className="nav desktop-nav">
          <ResponsiveNavMenu navGroups={navGroups} openGroup={openGroup} setOpenGroup={setOpenGroup} onNavigate={closeMenus} />
        </nav>
        <div className="header-actions">
          {driver ? (
            <>
              <Link className="ghost-button" to="/driver/dashboard">
                Driver Dashboard
              </Link>
              <button className="primary-button" onClick={driverLogout}>
                Driver Logout
              </button>
            </>
          ) : null}
          {user ? (
            <>
              <Link className="ghost-button" to="/dashboard">
                Dashboard
              </Link>
              <button className="primary-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="ghost-button" to="/login">
                Login
              </Link>
              <Link className="primary-button" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
        <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
          <ResponsiveNavMenu
            navGroups={navGroups}
            openGroup={openGroup}
            setOpenGroup={setOpenGroup}
            onNavigate={closeMenus}
            mobile
            menuOpen={mobileMenuOpen}
          />
          <div className="mobile-action-stack">
            {driver ? (
              <>
                <Link className="ghost-button" to="/driver/dashboard" onClick={closeMenus}>
                  Driver Dashboard
                </Link>
                <button className="primary-button" onClick={driverLogout}>
                  Driver Logout
                </button>
              </>
            ) : null}
            {user ? (
              <>
                <Link className="ghost-button" to="/dashboard" onClick={closeMenus}>
                  Dashboard
                </Link>
                <button className="primary-button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="ghost-button" to="/login" onClick={closeMenus}>
                  Login
                </Link>
                <Link className="primary-button" to="/register" onClick={closeMenus}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="user-pagebar">
        <button
          className="back-button"
          type="button"
          onClick={() => {
            if (canGoBack) {
              navigate(-1);
              return;
            }
            navigate("/");
          }}
        >
          Back
        </button>
        <div className="user-page-title">
          <span className="eyebrow">Explore</span>
          <strong>{pageTitle}</strong>
        </div>
      </div>
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function useSeo(title, description, schema) {
  useEffect(() => {
    if (title) document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description || "";

    const existing = document.querySelector('script[data-seo-schema="true"]');
    if (existing) existing.remove();

    if (schema) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-schema", "true");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const current = document.querySelector('script[data-seo-schema="true"]');
      if (current) current.remove();
    };
  }, [title, description, schema]);
}

function Hero({ featured }) {
  const visualItems = (featured || []).slice(0, 4);

  return (
    <section className="hero">
      <video
        className="hero-background-video"
        src="/videos/hero-river.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="hero-background-overlay" />
      <div className="hero-copy">
        <span className="pill">Premium local travel platform</span>
        <h1>Travel Smarter with Chalo Omkareshwar</h1>
        <p>
          Book rides, discover hotels, explore temples, and connect with local businesses through one trusted
          Omkareshwar platform.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" to="/book">
            Book Ride
          </Link>
          <Link className="ghost-button" to="/driver-apply">
            Become Driver
          </Link>
          <a className="ghost-button" href="#explore">
            Explore Omkareshwar
          </a>
        </div>
        <div className="hero-stats">
          <div>
            <strong>24/7</strong>
            <span>Travel support</span>
          </div>
          <div>
            <strong>4</strong>
            <span>User types</span>
          </div>
          <div>
            <strong>6+</strong>
            <span>Service categories</span>
          </div>
        </div>
      </div>
      <div className="hero-panel">
        <div className="hero-scene">
          <div className="hero-scene-orb orb-one" />
          <div className="hero-scene-orb orb-two" />
          <div className="hero-scene-orb orb-three" />
          <div className="hero-scene-card hero-scene-card-main">
            <span className="scene-label">Live travel flow</span>
            <strong>Omkareshwar Temple to River Ghat</strong>
            <p>Route animation, booking updates and service suggestions in one view.</p>
            <div className="scene-route">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="hero-scene-card hero-scene-card-side">
            <span className="scene-label">Popular stay</span>
            <strong>Verified accommodations</strong>
            <p>Fast contact, directions and support.</p>
          </div>
        </div>
        <div className="glass-card booking-card">
          <h3>Quick Ride Booking</h3>
          <p>Plan the route in seconds, get fare estimate and live travel tracking.</p>
          <BookingWidget />
        </div>
        <div className="feature-stack">
          {visualItems.map((item) => (
            <article className="mini-card mini-card-media" key={item._id || item.name}>
              <div className="mini-card-image">
                {item.imageUrl || item.gallery?.[0] ? (
                  <img src={resolveMediaSrc(item.imageUrl || item.gallery?.[0])} alt={item.name} />
                ) : (
                  <div className="mini-card-fallback">{String(item.name || "CO").slice(0, 2).toUpperCase()}</div>
                )}
              </div>
              <div>
                <span>{item.type}</span>
                <h4>{item.name}</h4>
                <p>{item.location}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    vehicleType: "cab",
    travelDate: "",
    notes: "",
    paymentMethod: "cash"
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!form.pickup || !form.destination) {
        setEstimate(null);
        return;
      }

      api
        .post("/bookings/estimate", {
          pickup: form.pickup,
          destination: form.destination,
          vehicleType: form.vehicleType
        })
        .then((response) => setEstimate(response.data.estimate))
        .catch(() => setEstimate(null));
    }, 400);

    return () => clearTimeout(handler);
  }, [form.pickup, form.destination, form.vehicleType]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setStatus("");
      const { data } = await api.post("/bookings", form);
      if (form.paymentMethod === "razorpay") {
        setStatus("Opening Razorpay checkout...");
        await openRazorpayCheckout({
          bookingId: data.booking.bookingId,
          onSuccess: async () => {
            setStatus(`Payment successful for booking ${data.booking.bookingId}.`);
            const refreshed = await api.get("/bookings/mine");
            setBookings(refreshed.data.bookings || []);
          },
          onFailure: (message) => setStatus(message)
        });
        return;
      }
      setStatus(`Booking ${data.booking.bookingId} created. Total amount: Rs ${data.booking.totalAmount}`);
      setForm({ pickup: "", destination: "", vehicleType: "cab", travelDate: "", notes: "", paymentMethod: "cash" });
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={onSubmit}>
      <input placeholder="Pickup location" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} />
      <input
        placeholder="Destination"
        value={form.destination}
        onChange={(e) => setForm({ ...form, destination: e.target.value })}
      />
      <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
        <option value="bike">Bike</option>
        <option value="auto">Auto</option>
        <option value="cab">Cab</option>
        <option value="traveller">Traveller</option>
      </select>
      <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
        <option value="cash">Pay Later / Cash</option>
        <option value="razorpay">Pay Online (Razorpay)</option>
      </select>
      <input type="date" value={form.travelDate} onChange={(e) => setForm({ ...form, travelDate: e.target.value })} />
      {estimate ? (
        <div className="estimate-box">
          <strong>{estimate.distanceKm} KM</strong>
          <span>{estimate.timeMinutes} Minutes</span>
          <span>Fare Rs {estimate.totalAmount}</span>
        </div>
      ) : null}
      <button className="primary-button full-width" type="submit" disabled={loading}>
        {loading ? "Booking..." : "Book Now"}
      </button>
      {status ? <p className="status-line">{status}</p> : null}
      {!user ? <p className="helper-text">Login required to confirm booking.</p> : null}
    </form>
  );
}

function CardGrid({ items, emptyText }) {
  if (!items?.length) {
    return <div className="empty-state">{emptyText}</div>;
  }

  return (
    <div className="card-grid">
      {items.map((item) => (
        <article className="info-card" key={item._id || item.name}>
          {item.imageUrl || item.gallery?.[0] ? (
            <div className="card-media">
              <img src={resolveMediaSrc(item.imageUrl || item.gallery?.[0])} alt={item.name} />
            </div>
          ) : null}
          <div className="info-card-top">
            <span className="tag">{item.type}</span>
            <strong>{item.rating ? `* ${item.rating}` : ""}</strong>
          </div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <div className="info-card-meta">
            <span>{item.location}</span>
            <strong>{item.price ? `Rs ${item.price}` : "Free"}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

function ListingCardGrid({
  items,
  emptyText,
  onToggleFavorite,
  favorites = [],
  canFavorite = false,
  detailBasePath = "",
  detailPathResolver = null
}) {
  if (!items?.length) {
    return <div className="empty-state">{emptyText}</div>;
  }

  return (
    <div className="card-grid">
      {items.map((item) => {
        const isSaved = favorites.includes(item._id);
        return (
          <article className="info-card" key={item._id || item.name}>
            {item.imageUrl || item.gallery?.[0] ? (
              <div className="card-media">
                <img src={resolveMediaSrc(item.imageUrl || item.gallery?.[0])} alt={item.name} />
              </div>
            ) : null}
            <div className="info-card-top">
              <span className="tag">{item.type}</span>
              <strong>{item.rating ? `* ${item.rating}` : ""}</strong>
            </div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="info-card-meta">
              <span>{item.location}</span>
              <strong>{item.price ? `Rs ${item.price}` : "Free"}</strong>
            </div>
            {item.slug && (detailPathResolver || detailBasePath) ? (
              <Link className="ghost-button full-width" to={detailPathResolver ? detailPathResolver(item) : `${detailBasePath}/${item.slug}`}>
                View Details
              </Link>
            ) : null}
            {canFavorite ? (
              <button className="ghost-button full-width" type="button" onClick={() => onToggleFavorite?.(item._id)}>
                {isSaved ? "Remove Saved" : "Save"}
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ListingFilters({
  search,
  setSearch,
  category,
  setCategory,
  availability,
  setAvailability,
  minRating,
  setMinRating,
  categories = []
}) {
  return (
    <div className="listing-filters">
      <input
        className="filter-input"
        placeholder="Search by name, area or description"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select className="filter-input" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>
      <select className="filter-input" value={availability} onChange={(e) => setAvailability(e.target.value)}>
        <option value="">Any availability</option>
        <option value="available">Available</option>
        <option value="limited">Limited</option>
        <option value="busy">Busy</option>
        <option value="closed">Closed</option>
      </select>
      <select className="filter-input" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
        <option value="">Any rating</option>
        <option value="4">4+ stars</option>
        <option value="3">3+ stars</option>
        <option value="2">2+ stars</option>
      </select>
    </div>
  );
}

function StatusFlow({ currentStatus, bookingId }) {
  const steps = [
    { key: "pending", label: "Booking Created" },
    { key: "driver_assigned", label: "Driver Assigned" },
    { key: "driver_reached", label: "Driver Reached" },
    { key: "ride_started", label: "Ride Started" },
    { key: "ride_completed", label: "Ride Completed" },
    { key: "payment_settled", label: "Payment Settled" }
  ];

  const activeIndex = steps.findIndex((step) => step.key === currentStatus);

  return (
    <div className="status-flow">
      <div className="status-flow-head">
        <strong>{bookingId}</strong>
        <span>{currentStatus?.replaceAll("_", " ")}</span>
      </div>
      <div className="status-flow-steps">
        {steps.map((step, index) => (
          <div key={step.key} className={`flow-step ${index <= activeIndex ? "active" : ""}`}>
            <span>{index + 1}</span>
            <p>{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildMapsQuery(text) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
}

function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-razorpay-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.setAttribute("data-razorpay-sdk", "true");
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout({ bookingId, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay checkout.");
  }

  const { data } = await api.post("/payments/razorpay-order", { bookingId });
  const options = {
    key: data.keyId,
    amount: data.amount,
    currency: data.currency,
    name: "Chalo Omkareshwar",
    description: `Payment for ${data.booking.bookingId}`,
    order_id: data.orderId,
    prefill: {
      name: data.booking.user?.name || "",
      email: data.booking.user?.email || "",
      contact: data.booking.user?.phone || ""
    },
    notes: {
      bookingId: data.booking.bookingId
    },
    theme: {
      color: "#f97316"
    },
    modal: {
      ondismiss: () => onFailure?.("Payment window closed.")
    },
    handler: async (response) => {
      try {
        await api.post("/payments/razorpay-verify", {
          bookingId: data.booking.bookingId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
        onSuccess?.(response, data.booking);
      } catch (error) {
        onFailure?.(error.response?.data?.message || "Payment verification failed.");
      }
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.on("payment.failed", (response) => {
    onFailure?.(response.error?.description || "Payment failed.");
  });
  razorpay.open();
}

function HomePage() {
  const [data, setData] = useState({ featured: [], byType: {}, popularRoutes: [], categories: [] });

  useSeo(
    "Chalo Omkareshwar | Ride Booking, Hotels, Temples and Travel Guide",
    "Book rides, discover hotels, dharamshalas, temples and restaurants across Omkareshwar with a mobile-friendly travel platform.",
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Chalo Omkareshwar",
      url: "https://chaloomkareshwar.com"
    }
  );

  useEffect(() => {
    api.get("/listings/home").then((response) => setData(response.data));
  }, []);

  const testimonials = [
    {
      name: "Aarti Sharma",
      role: "Pilgrim",
      quote: "The platform makes Omkareshwar travel much easier and trusted."
    },
    {
      name: "Ravi Yadav",
      role: "Driver",
      quote: "Booking requests and earnings tracking are clear and simple."
    },
    {
      name: "Mohan Singh",
      role: "Hotel owner",
      quote: "We finally get proper visibility for local stays and services."
    }
  ];

  return (
    <WebsiteShell>
      <main className="page">
        <Hero featured={data.featured} />

        <section className="section" id="explore">
          <SectionHeading
            eyebrow="Featured Categories"
            title="Everything a traveler needs in one place"
            subtitle="Ride booking, stays, temple guidance, food, and local travel support."
          />
          <div className="pill-grid">
            {(data.categories || []).map((item) => (
              <Link
                className="pill-card"
                key={item.key}
                to={
                  item.key === "hotel"
                    ? "/hotels"
                    : item.key === "dharamshala"
                      ? "/dharamshalas"
                      : item.key === "temple"
                        ? "/temples"
                        : item.key === "restaurant"
                          ? "/restaurants"
                          : item.key === "guide"
                            ? "/travel-guide"
                            : item.key === "attraction"
                              ? "/attractions"
                              : `/category/${item.key}`
                }
              >
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <SectionHeading
            eyebrow="Popular Routes"
            title="Most used connections"
            subtitle="Quick access to the routes pilgrims and travelers ask for most."
          />
          <CardGrid items={data.popularRoutes} emptyText="No routes available yet." />
        </section>

        <section className="section">
          <SectionHeading
            eyebrow="Featured Stays and Services"
            title="Trusted options for every type of visitor"
            subtitle="Show the most useful listings first so users can decide faster."
          />
          <CardGrid items={data.featured} emptyText="No featured listings yet." />
        </section>

        <section className="section">
          <SectionHeading
            eyebrow="Why Chalo Omkareshwar"
            title="Designed for trust, speed and local convenience"
            subtitle="The experience is built around pilgrim comfort and local mobility."
          />
          <div className="feature-grid">
            {[
              { title: "Reliable booking", text: "Book rides with clear price estimation and secure login." },
              { title: "Local discovery", text: "Find hotels, dharamshalas, restaurants and temples in one flow." },
              { title: "Admin control", text: "Listings, bookings and users can be managed centrally." }
            ].map((item) => (
              <article className="feature-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <SectionHeading
            eyebrow="Testimonials"
            title="What different users expect from the platform"
            subtitle="Social proof section ready for part 2 and part 3 expansion."
          />
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article className="testimonial-card" key={item.name}>
                <p>"{item.quote}"</p>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <div>
            <strong>Chalo Omkareshwar</strong>
            <p>Travel smarter across Omkareshwar and nearby regions.</p>
          </div>
          <div className="footer-links">
            <Link to="/">About</Link>
            <Link to="/category/service">Services</Link>
            <Link to="/login">Support</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms & Conditions</Link>
          </div>
          <div>
            <p>Contact: support@chaloomkareshwar.com</p>
            <p>Phone: +91 90000 00000</p>
          </div>
        </footer>
      </main>
    </WebsiteShell>
  );
}

function HotelPage() {
  return (
    <ListingDirectoryPage
      type="hotel"
      title="Hotels in Omkareshwar"
      eyebrow="Hotel Management"
      subtitle="Budget, premium, family and pilgrim hotel listings with direct contact and directions."
      detailBasePath="/hotels"
    />
  );
}

function HotelDetailRoute() {
  return <ListingDetailPage typeLabel="Hotel" />;
}

function DharamshalaPage() {
  return (
    <ListingDirectoryPage
      type="dharamshala"
      title="Dharamshalas in Omkareshwar"
      eyebrow="Dharamshala Management"
      subtitle="Verified pilgrim stays with easy call, WhatsApp and directions."
      detailBasePath="/dharamshalas"
    />
  );
}

function DharamshalaDetailRoute() {
  return <ListingDetailPage typeLabel="Dharamshala" />;
}

function RestaurantPage() {
  return (
    <ListingDirectoryPage
      type="restaurant"
      title="Restaurants and Dhabas"
      eyebrow="Food Options"
      subtitle="Family restaurants, local food, traditional meals and dhabas around Omkareshwar."
      detailBasePath="/restaurants"
    />
  );
}

function RestaurantDetailRoute() {
  return <ListingDetailPage typeLabel="Restaurant" />;
}

function TemplePage() {
  return (
    <ListingDirectoryPage
      type="temple"
      title="Temples and Religious Attractions"
      eyebrow="Temple Directory"
      subtitle="Temple timings, history, aarti timing and nearby services in one place."
      detailBasePath="/temples"
    />
  );
}

function TempleDetailRoute() {
  return <ListingDetailPage typeLabel="Temple" />;
}

function AuthPage({ mode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  if (auth.user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (isLogin) {
        await auth.login({ email: form.email, password: form.password });
      } else {
        await auth.register(form);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebsiteShell>
      <main className="auth-wrap">
        <form className="auth-card" onSubmit={onSubmit}>
          <span className="pill">{isLogin ? "Welcome back" : "Create account"}</span>
          <h1>{isLogin ? "Login to continue" : "Register to get started"}</h1>
          <p>{isLogin ? "Access bookings, favorites and dashboard." : "Create your traveler profile in one step."}</p>
          {!isLogin ? (
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          ) : null}
          <input placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {!isLogin ? (
            <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          ) : null}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="primary-button full-width" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
          {error ? <p className="status-line error">{error}</p> : null}
          <p className="helper-text">
            {isLogin ? (
              <Link to="/register">Need an account? Register here</Link>
            ) : (
              <Link to="/login">Already have an account? Login here</Link>
            )}
          </p>
        </form>
      </main>
    </WebsiteShell>
  );
}

function DashboardPage() {
  const auth = useAuth();
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    vehicleType: "cab",
    travelDate: "",
    notes: "",
    paymentMethod: "cash"
  });
  const [message, setMessage] = useState("");
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!form.pickup || !form.destination) {
        setEstimate(null);
        return;
      }

      api
        .post("/bookings/estimate", {
          pickup: form.pickup,
          destination: form.destination,
          vehicleType: form.vehicleType
        })
        .then((response) => setEstimate(response.data.estimate))
        .catch(() => setEstimate(null));
    }, 400);

    return () => clearTimeout(handler);
  }, [form.pickup, form.destination, form.vehicleType]);

  useEffect(() => {
    if (!auth.user) return;
    api.get("/bookings/mine").then((response) => setBookings(response.data.bookings));
  }, [auth.user]);

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  const submitRide = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/bookings", form);
      setBookings((current) => [data.booking, ...current]);
      if (form.paymentMethod === "razorpay") {
        setMessage("Opening Razorpay checkout...");
        await openRazorpayCheckout({
          bookingId: data.booking.bookingId,
          onSuccess: async () => {
            setMessage(`Payment successful for booking ${data.booking.bookingId}.`);
            const refreshed = await api.get("/bookings/mine");
            setBookings(refreshed.data.bookings || []);
          },
          onFailure: (message) => setMessage(message)
        });
        return;
      }
      setMessage(`Ride booking ${data.booking.bookingId} saved successfully.`);
      setForm({ pickup: "", destination: "", vehicleType: "cab", travelDate: "", notes: "", paymentMethod: "cash" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Booking could not be saved.");
    }
  };

  return (
    <WebsiteShell>
      <main className="page dashboard">
        <section className="dashboard-hero">
          <div>
            <span className="pill">User Dashboard</span>
            <h1>Welcome, {auth.user.name}</h1>
            <p>Manage your bookings, rides and saved travel needs from here.</p>
          </div>
          <div className="dashboard-summary">
            <div>
              <strong>{bookings.length}</strong>
              <span>Bookings</span>
            </div>
            <div>
              <strong>{auth.user.role}</strong>
              <span>Account type</span>
            </div>
          </div>
        </section>

        <section className="section compact">
          <SectionHeading eyebrow="New Booking" title="Book a local ride" subtitle="Create a ride request directly from dashboard." />
          <form className="dashboard-form" onSubmit={submitRide}>
            <input placeholder="Pickup" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} />
            <input placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
              <option value="cab">Cab</option>
              <option value="traveller">Traveller</option>
            </select>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="cash">Pay Later / Cash</option>
              <option value="razorpay">Pay Online (Razorpay)</option>
            </select>
            <input type="date" value={form.travelDate} onChange={(e) => setForm({ ...form, travelDate: e.target.value })} />
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            {estimate ? (
              <div className="estimate-box">
                <strong>{estimate.distanceKm} KM</strong>
                <span>{estimate.timeMinutes} Minutes</span>
                <span>Fare Rs {estimate.totalAmount}</span>
              </div>
            ) : null}
            <button className="primary-button" type="submit">
              Submit Ride
            </button>
          </form>
          {message ? <p className="status-line">{message}</p> : null}
        </section>

        <section className="section compact">
          <SectionHeading eyebrow="Bookings" title="Your recent ride requests" subtitle="All user bookings are stored in MongoDB." />
          <CardGrid
            items={bookings.map((item) => ({
              ...item,
              type: item.status,
              name: `${item.bookingId} | ${item.pickup} -> ${item.destination}`,
              description: `${item.vehicleType}${item.bookingDate ? ` | ${item.bookingDate}` : ""}${item.bookingTime ? ` | ${item.bookingTime}` : ""}${item.notes ? ` | ${item.notes}` : ""}`,
              location: `Total Rs ${item.totalAmount} | Payment: ${item.paymentStatus}`
            }))}
            emptyText="No bookings yet."
          />
        </section>
      </main>
    </WebsiteShell>
  );
}

function CategoryPage() {
  const { user } = useAuth();
  const location = useLocation();
  const category = location.pathname.split("/").pop();
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    api.get(`/listings?type=${category}`).then((response) => setItems(response.data.listings));
    if (user) {
      api.get("/profile").then((response) => {
        setFavorites((response.data.user.favorites || []).map((item) => item._id));
      });
    }
  }, [category]);

  const categoryOptions = [...new Set(items.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const filteredItems = items.filter((item) => {
    const haystack = [item.name, item.description, item.location, item.category].join(" ").toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesAvailability = !availability || (item.availabilityStatus || "").toLowerCase() === availability;
    const matchesRating = !minRating || Number(item.rating || 0) >= Number(minRating);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesAvailability && matchesRating && matchesCategory;
  });

  const toggleFavorite = async (id) => {
    const { data } = await api.patch(`/profile/favorites/${id}`);
    setFavorites((data.user.favorites || []).map((item) => item._id));
  };

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading
            eyebrow="Category Listing"
            title={category}
            subtitle="Dynamic category page connected to MongoDB listings."
          />
          <ListingFilters
            search={search}
            setSearch={setSearch}
            category={selectedCategory}
            setCategory={setSelectedCategory}
            availability={availability}
            setAvailability={setAvailability}
            minRating={minRating}
            setMinRating={setMinRating}
            categories={categoryOptions}
          />
          <ListingCardGrid
            items={filteredItems}
            emptyText="No records found."
            canFavorite={!!user}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </section>
      </main>
    </WebsiteShell>
  );
}

function ListingDirectoryPage({ type, title, eyebrow, subtitle, detailBasePath }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useSeo(`${title} | Chalo Omkareshwar`, subtitle, {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: subtitle
  });

  useEffect(() => {
    api.get(`/listings?type=${type}`).then((response) => setItems(response.data.listings));
    if (user) {
      api.get("/profile").then((response) => setFavorites((response.data.user.favorites || []).map((item) => item._id)));
    }
  }, [type, user]);

  const categoryOptions = [...new Set(items.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const filteredItems = items.filter((item) => {
    const haystack = [item.name, item.description, item.location, item.category].join(" ").toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesAvailability = !availability || (item.availabilityStatus || "").toLowerCase() === availability;
    const matchesRating = !minRating || Number(item.rating || 0) >= Number(minRating);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesAvailability && matchesRating && matchesCategory;
  });

  const toggleFavorite = async (id) => {
    const { data } = await api.patch(`/profile/favorites/${id}`);
    setFavorites((data.user.favorites || []).map((item) => item._id));
  };

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <ListingFilters
            search={search}
            setSearch={setSearch}
            category={selectedCategory}
            setCategory={setSelectedCategory}
            availability={availability}
            setAvailability={setAvailability}
            minRating={minRating}
            setMinRating={setMinRating}
            categories={categoryOptions}
          />
          <ListingCardGrid
            items={filteredItems}
            emptyText={`No ${title.toLowerCase()} found.`}
            canFavorite={!!user}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            detailBasePath={detailBasePath}
          />
        </section>
      </main>
    </WebsiteShell>
  );
}

function ListingDetailPage({ typeLabel }) {
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ authorName: "", rating: 5, comment: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get(`/listings/${slug}`).then((response) => setData(response.data));
    api.get(`/reviews/${slug}`).then((response) => setReviews(response.data.reviews || []));
  }, [slug]);

  useSeo(data?.seo?.title || `Loading ${typeLabel}...`, data?.seo?.description || "", {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: data?.listing?.name || typeLabel
  });

  const listing = data?.listing;
  const contactNumber = listing?.contactNumber || listing?.contact;
  const whatsappNumber = listing?.whatsappNumber || listing?.contactNumber || listing?.contact;

  if (!listing) {
    return (
      <WebsiteShell>
        <main className="auth-wrap">
          <div className="auth-card">
            <span className="pill">{typeLabel}</span>
            <h1>Loading details...</h1>
          </div>
        </main>
      </WebsiteShell>
    );
  }

  const openWhatsApp = () => {
    if (!whatsappNumber) return;
    window.open(
      `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I want information about ${listing.name}.`)}`,
      "_blank"
    );
  };

  const goDirections = () => {
    window.open(buildMapsQuery(listing.mapsLocation || listing.location || listing.name), "_blank");
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      if (!user) {
        setMessage("Login required to submit a review.");
        return;
      }
      await api.post(`/reviews/${slug}`, reviewForm);
      setMessage("Review submitted for approval.");
      setReviewForm({ authorName: user.name || "", rating: 5, comment: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to submit review.");
    }
  };

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <div className="detail-hero">
            <div>
              <span className="pill">{typeLabel}</span>
              <h1>{listing.name}</h1>
              <p>{listing.longDescription || listing.description}</p>
              <div className="hero-actions">
                {contactNumber ? (
                  <a className="primary-button" href={`tel:${contactNumber}`}>
                    Call Now
                  </a>
                ) : null}
                {whatsappNumber ? (
                  <button className="ghost-button" type="button" onClick={openWhatsApp}>
                    WhatsApp
                  </button>
                ) : null}
                <button className="ghost-button" type="button" onClick={goDirections}>
                  Get Directions
                </button>
                <button className="ghost-button" type="button" onClick={() => navigate("/dashboard")}>
                  Book Ride
                </button>
              </div>
            </div>
            <div className="detail-facts">
              <div>
                <strong>{listing.rating || 0}</strong>
                <span>Rating</span>
              </div>
              <div>
                <strong>{listing.priceRange || `Rs ${listing.price || 0}`}</strong>
                <span>Price</span>
              </div>
              <div>
                <strong>{listing.availabilityStatus || "available"}</strong>
                <span>Status</span>
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <article className="detail-card">
              <h3>Overview</h3>
              <p>{listing.description}</p>
              {listing.category ? <p>Category: {listing.category}</p> : null}
              {listing.address ? <p>Address: {listing.address}</p> : null}
              {listing.distanceFromTemple ? <p>Distance from Temple: {listing.distanceFromTemple}</p> : null}
              {listing.timings ? <p>Timings: {listing.timings}</p> : null}
              {listing.aartiTimings ? <p>Aarti: {listing.aartiTimings}</p> : null}
            </article>
            <article className="detail-card">
              <h3>Facilities</h3>
              <ul className="detail-list">
                {(listing.facilities || listing.amenities || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
                {!((listing.facilities || listing.amenities || []).length) ? <li>No facilities listed yet.</li> : null}
              </ul>
            </article>
            <article className="detail-card">
              <h3>Gallery</h3>
              <div className="gallery-grid">
                {(listing.gallery?.length ? listing.gallery : [listing.imageUrl].filter(Boolean)).map((src, index) => (
                  <div className="gallery-item" key={`${src}-${index}`}>
                    <img src={resolveMediaSrc(src)} alt={`${listing.name} ${index + 1}`} />
                  </div>
                ))}
                {!((listing.gallery?.length ? listing.gallery : [listing.imageUrl].filter(Boolean)).length) ? (
                  <div className="empty-state">No images uploaded yet.</div>
                ) : null}
              </div>
            </article>
            <article className="detail-card">
              <h3>Nearby Places</h3>
              <p>Attractions: {(listing.nearbyAttractions || []).join(", ") || "Not added yet."}</p>
              <p>Hotels: {(listing.nearbyHotels || []).join(", ") || "Not added yet."}</p>
              <p>Restaurants: {(listing.nearbyRestaurants || []).join(", ") || "Not added yet."}</p>
              <p>Temples: {(listing.nearbyTemples || []).join(", ") || "Not added yet."}</p>
            </article>
          </div>

          {listing.roomTypes?.length ? (
            <article className="detail-card">
              <h3>Room Types</h3>
              <div className="pill-grid">
                {listing.roomTypes.map((item) => (
                  <span className="pill-card" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ) : null}

          {listing.menuHighlights?.length ? (
            <article className="detail-card">
              <h3>Menu Highlights</h3>
              <div className="pill-grid">
                {listing.menuHighlights.map((item) => (
                  <span className="pill-card" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ) : null}

          {listing.history ? (
            <article className="detail-card">
              <h3>History</h3>
              <p>{listing.history}</p>
            </article>
          ) : null}

          {listing.importance ? (
            <article className="detail-card">
              <h3>Importance</h3>
              <p>{listing.importance}</p>
            </article>
          ) : null}

          <article className="detail-card">
            <h3>Reviews</h3>
            {reviews.length ? (
              <div className="card-grid">
                {reviews.map((review) => (
                  <article className="info-card" key={review._id}>
                    <div className="info-card-top">
                      <span className="tag">{review.authorName}</span>
                      <strong>{review.rating}/5</strong>
                    </div>
                    <p>{review.comment}</p>
                    {review.adminReply ? <p>Admin reply: {review.adminReply}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">No reviews approved yet.</div>
            )}
            {user ? (
              <form className="dashboard-form" onSubmit={submitReview} style={{ marginTop: "1rem" }}>
                <input
                  placeholder="Your name"
                  value={reviewForm.authorName}
                  onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })}
                />
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
                <textarea
                  rows="4"
                  placeholder="Write your review"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                <button className="primary-button" type="submit">
                  Submit Review
                </button>
              </form>
            ) : (
              <p className="helper-text">Login to add your review.</p>
            )}
          </article>

          {message ? <p className="status-line">{message}</p> : null}

          {data?.related?.length ? (
            <article className="detail-card">
              <h3>Nearby Suggestions</h3>
              <ListingCardGrid
                items={data.related}
                emptyText="No suggestions."
                detailBasePath={typeLabel === "Hotel" ? "/hotels" : typeLabel === "Dharamshala" ? "/dharamshalas" : typeLabel === "Restaurant" ? "/restaurants" : "/temples"}
              />
            </article>
          ) : null}
        </section>
      </main>
    </WebsiteShell>
  );
}

function TravelGuidePage() {
  const [data, setData] = useState({ sections: [] });

  useSeo("Omkareshwar Travel Guide | Chalo Omkareshwar", "About Omkareshwar, history, travel tips, local transportation and emergency information.", {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Omkareshwar Travel Guide"
  });

  useEffect(() => {
    api.get("/listings/guide").then((response) => setData(response.data));
  }, []);

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading
            eyebrow="Travel Guide"
            title="Digital Omkareshwar travel guide"
            subtitle="A simple and premium guide for pilgrims, tourists and local travelers."
          />
          <div className="detail-grid">
            {(data.sections || []).map((section) => (
              <article className="detail-card" key={section.key}>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </WebsiteShell>
  );
}

function AttractionsPage() {
  const [data, setData] = useState({ attractions: [] });

  useSeo("Omkareshwar Attractions | Chalo Omkareshwar", "Omkareshwar Jyotirlinga, ghats, viewpoints and nearby attractions.", {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Omkareshwar Attractions"
  });

  useEffect(() => {
    api.get("/listings/attractions").then((response) => setData(response.data));
  }, []);

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading eyebrow="Local Attractions" title="Places to visit around Omkareshwar" subtitle="Explore sacred points, ghats and local sightseeing options." />
          <ListingCardGrid
            items={data.attractions}
            emptyText="No attractions available."
            detailPathResolver={(item) =>
              item.type === "hotel"
                ? `/hotels/${item.slug}`
                : item.type === "dharamshala"
                  ? `/dharamshalas/${item.slug}`
                  : item.type === "restaurant"
                    ? `/restaurants/${item.slug}`
                    : `/temples/${item.slug}`
            }
          />
        </section>
      </main>
    </WebsiteShell>
  );
}

function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  useSeo("Omkareshwar Blog | Chalo Omkareshwar", "Travel guides, temple information, hotel recommendations and tourism updates for Omkareshwar.", {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Chalo Omkareshwar Blog"
  });

  useEffect(() => {
    api.get("/blogs").then((response) => setBlogs(response.data.blogs || []));
  }, []);

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading eyebrow="Blog" title="Travel and tourism articles" subtitle="SEO-friendly blog system for organic search growth." />
          <div className="card-grid">
            {blogs.map((post) => (
              <article className="info-card" key={post.slug}>
                <span className="tag">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link className="ghost-button full-width" to={`/blog/${post.slug}`}>
                  Read More
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </WebsiteShell>
  );
}

function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    api.get(`/blogs/${slug}`).then((response) => {
      setPost(response.data.blog);
      setRelated(response.data.related || []);
    });
  }, [slug]);

  useSeo(post?.title || "Blog Post", post?.excerpt || "", {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post?.title || "Blog Post"
  });

  if (!post) {
    return (
      <WebsiteShell>
        <main className="auth-wrap">
          <div className="auth-card">
            <span className="pill">Blog</span>
            <h1>Loading article...</h1>
          </div>
        </main>
      </WebsiteShell>
    );
  }

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <div className="detail-hero">
            <div>
              <span className="pill">{post.category}</span>
              <h1>{post.title}</h1>
              <p>{post.excerpt}</p>
            </div>
          </div>
          <article className="detail-card">
            <p>{post.content}</p>
          </article>
          {related.length ? (
            <article className="detail-card">
              <h3>Related Posts</h3>
              <div className="card-grid">
                {related.map((item) => (
                  <article className="info-card" key={item._id}>
                    <h4>{item.title}</h4>
                    <p>{item.excerpt}</p>
                    <Link className="ghost-button full-width" to={`/blog/${item.slug}`}>
                      Open
                    </Link>
                  </article>
                ))}
              </div>
            </article>
          ) : null}
        </section>
      </main>
    </WebsiteShell>
  );
}

function SeoLandingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [listings, setListings] = useState([]);
  const resolvedSlug = slug || location.pathname.replace(/^\//, "");

  useEffect(() => {
    api.get(`/seo/pages/${resolvedSlug}`).then((response) => {
      setPage(response.data.page);
      setListings(response.data.listings || []);
    });
  }, [resolvedSlug]);

  useSeo(page?.title || "SEO Page", page?.description || "", {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page?.title || "SEO Page"
  });

  if (!page) {
    return (
      <WebsiteShell>
        <main className="auth-wrap">
          <div className="auth-card">
            <span className="pill">SEO</span>
            <h1>Loading page...</h1>
          </div>
        </main>
      </WebsiteShell>
    );
  }

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <div className="detail-hero">
            <div>
              <span className="pill">SEO Landing Page</span>
              <h1>{page.title}</h1>
              <p>{page.description}</p>
              <div className="hero-actions">
                <Link className="primary-button" to="/dashboard">
                  Book Ride
                </Link>
                <Link className="ghost-button" to="/travel-guide">
                  Travel Guide
                </Link>
              </div>
            </div>
            <div className="detail-facts">
              <div>
                <strong>{page.listingType}</strong>
                <span>Primary Category</span>
              </div>
              <div>
                <strong>{listings.length}</strong>
                <span>Suggestions</span>
              </div>
              <div>
                <strong>{page.hero}</strong>
                <span>Focus</span>
              </div>
            </div>
          </div>
          <article className="detail-card" style={{ marginTop: "1rem" }}>
            <h3>Top results</h3>
            <ListingCardGrid
              items={listings}
              emptyText="No listings found."
              detailPathResolver={(item) =>
                item.type === "hotel"
                  ? `/hotels/${item.slug}`
                  : item.type === "dharamshala"
                    ? `/dharamshalas/${item.slug}`
                    : item.type === "restaurant"
                      ? `/restaurants/${item.slug}`
                      : `/temples/${item.slug}`
              }
            />
          </article>
        </section>
      </main>
    </WebsiteShell>
  );
}

function DriverApplyPage() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    vehicleType: "bike",
    vehicleNumber: "",
    licenseNumber: "",
    aadharNumber: "",
    experienceYears: 0,
    documents: {
      driverPhoto: "",
      licenseCopy: "",
      rcBook: "",
      aadharCard: "",
      vehiclePhoto: "",
      insuranceCopy: ""
    }
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const handleDocumentChange = (key, value) =>
    setForm((current) => ({ ...current, documents: { ...current.documents, [key]: value } }));

  const submitDriver = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/auth/driver-apply", form);
      setMessage(`Application submitted. Status: ${data.driver.status}`);
      setForm({
        name: "",
        mobile: "",
        email: "",
        address: "",
        vehicleType: "bike",
        vehicleNumber: "",
        licenseNumber: "",
        aadharNumber: "",
        experienceYears: 0,
        documents: {
          driverPhoto: "",
          licenseCopy: "",
          rcBook: "",
          aadharCard: "",
          vehiclePhoto: "",
          insuranceCopy: ""
        }
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to submit driver application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading
            eyebrow="Become a Driver"
            title="Driver registration form"
            subtitle="Apply for bike, auto, cab or traveller onboarding."
          />
          <form className="driver-form" onSubmit={submitDriver}>
            <input placeholder="Full name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
            <input placeholder="Mobile number" value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value)} />
            <input placeholder="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            <input placeholder="Address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            <select value={form.vehicleType} onChange={(e) => handleChange("vehicleType", e.target.value)}>
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
              <option value="cab">Cab</option>
              <option value="traveller">Traveller</option>
            </select>
            <input
              placeholder="Vehicle number"
              value={form.vehicleNumber}
              onChange={(e) => handleChange("vehicleNumber", e.target.value)}
            />
            <input
              placeholder="License number"
              value={form.licenseNumber}
              onChange={(e) => handleChange("licenseNumber", e.target.value)}
            />
            <input
              placeholder="Aadhar number"
              value={form.aadharNumber}
              onChange={(e) => handleChange("aadharNumber", e.target.value)}
            />
            <input
              type="number"
              placeholder="Years of experience"
              value={form.experienceYears}
              onChange={(e) => handleChange("experienceYears", Number(e.target.value))}
            />
            <input
              placeholder="Driver photo URL"
              value={form.documents.driverPhoto}
              onChange={(e) => handleDocumentChange("driverPhoto", e.target.value)}
            />
            <input
              placeholder="License copy URL"
              value={form.documents.licenseCopy}
              onChange={(e) => handleDocumentChange("licenseCopy", e.target.value)}
            />
            <input placeholder="RC book URL" value={form.documents.rcBook} onChange={(e) => handleDocumentChange("rcBook", e.target.value)} />
            <input
              placeholder="Aadhar card URL"
              value={form.documents.aadharCard}
              onChange={(e) => handleDocumentChange("aadharCard", e.target.value)}
            />
            <input
              placeholder="Vehicle photo URL"
              value={form.documents.vehiclePhoto}
              onChange={(e) => handleDocumentChange("vehiclePhoto", e.target.value)}
            />
            <input
              placeholder="Insurance copy URL"
              value={form.documents.insuranceCopy}
              onChange={(e) => handleDocumentChange("insuranceCopy", e.target.value)}
            />
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
          {message ? <p className="status-line">{message}</p> : null}
        </section>
      </main>
    </WebsiteShell>
  );
}

function DriverLoginPage() {
  const { driver, login } = useDriverAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: "", licenseNumber: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (driver) {
    return <Navigate to="/driver/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      await login(form);
      navigate("/driver/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to login driver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebsiteShell>
      <main className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <span className="pill">Driver Portal</span>
          <h1>Driver login</h1>
          <p>Use your registered mobile number and license number to open the dashboard.</p>
          <input
            placeholder="Mobile number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
          <input
            placeholder="License number"
            value={form.licenseNumber}
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
          />
          <button className="primary-button full-width" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Open Dashboard"}
          </button>
          {message ? <p className="status-line">{message}</p> : null}
          <p className="helper-text">
            New driver? <Link to="/driver-apply">Apply here</Link>
          </p>
        </form>
      </main>
    </WebsiteShell>
  );
}

function DriverDashboardPage() {
  const { driver, logout } = useDriverAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [actionId, setActionId] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await driverApi.get("/drivers/auth/dashboard");
      setDashboard(data);
    } catch (error) {
      setActionMessage(error.response?.data?.message || "Unable to load driver dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!driver) return;
    loadDashboard();
    const timer = setInterval(loadDashboard, 20000);
    return () => clearInterval(timer);
  }, [driver]);

  if (!driver) {
    return <Navigate to="/driver/login" replace />;
  }

  const respond = async (bookingId, decision) => {
    try {
      setActionId(bookingId);
      setActionMessage("");
      await driverApi.patch(`/drivers/auth/bookings/${bookingId}/respond`, { decision });
      await loadDashboard();
      setActionMessage(decision === "accept" ? "Booking accepted." : "Booking rejected.");
    } catch (error) {
      setActionMessage(error.response?.data?.message || "Unable to update booking.");
    } finally {
      setActionId("");
    }
  };

  const bookings = dashboard?.bookings || [];
  const stats = dashboard?.stats || {};

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <div className="dashboard-hero">
            <div>
              <span className="pill">Driver Dashboard</span>
              <h1>{driver.name}</h1>
              <p>
                {driver.vehicleType} | {driver.vehicleNumber} | {driver.mobile}
              </p>
            </div>
            <div className="dashboard-summary">
              <div>
                <strong>{stats.activeRequests ?? 0}</strong>
                <span>Active Requests</span>
              </div>
              <div>
                <strong>Rs {stats.totalEarnings ?? 0}</strong>
                <span>Total Earnings</span>
              </div>
              <div>
                <strong>{stats.completedRides ?? 0}</strong>
                <span>Completed</span>
              </div>
            </div>
          </div>

          <div className="hero-actions" style={{ marginBottom: "1rem" }}>
            <button className="ghost-button" type="button" onClick={loadDashboard} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Dashboard"}
            </button>
            <button className="primary-button" type="button" onClick={logout}>
              Logout Driver
            </button>
          </div>

          {actionMessage ? <p className="status-line">{actionMessage}</p> : null}

          <div className="booking-list">
            {bookings.map((booking) => {
              const isActionable = ["pending", "driver_assigned"].includes(booking.status);
              return (
                <article className="booking-card" key={booking._id}>
                  <div className="booking-card-head">
                    <div>
                      <strong>{booking.bookingId}</strong>
                      <p>
                        {booking.pickup} -&gt; {booking.destination}
                      </p>
                    </div>
                    <span className="badge">{booking.status}</span>
                  </div>
                  <p>
                    Passenger: {booking.user?.name || "-"} | {booking.user?.phone || booking.user?.email || "-"}
                  </p>
                  <p>
                    Vehicle: {booking.vehicleType} | Fare: Rs {booking.totalAmount} | Payment: {booking.paymentStatus}
                  </p>
                  <p>
                    {booking.bookingDate} {booking.bookingTime}
                  </p>
                  <div className="map-links">
                    <a href={buildMapsQuery(booking.pickup)} target="_blank" rel="noreferrer">
                      Pickup map
                    </a>
                    <a href={buildMapsQuery(`${booking.pickup} to ${booking.destination}`)} target="_blank" rel="noreferrer">
                      Route map
                    </a>
                  </div>
                  {isActionable ? (
                    <div className="hero-actions">
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => respond(booking._id, "accept")}
                        disabled={actionId === booking._id}
                      >
                        Accept
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => respond(booking._id, "reject")}
                        disabled={actionId === booking._id}
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
            {!bookings.length ? <div className="empty-state">No driver bookings yet.</div> : null}
          </div>
        </section>
      </main>
    </WebsiteShell>
  );
}

function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState(null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const loadBookings = async () => {
    const { data } = await api.get("/bookings/mine");
    setBookings(data.bookings);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (!selectedBooking) return;
    const timer = setInterval(() => openBooking(selectedBooking.booking.bookingId), 20000);
    return () => clearInterval(timer);
  }, [selectedBooking]);

  const filtered = bookings.filter((booking) => {
    if (activeTab === "upcoming") return ["pending", "driver_assigned", "driver_reached", "ride_started"].includes(booking.status);
    if (activeTab === "completed") return ["ride_completed", "payment_settled"].includes(booking.status);
    return booking.status === "cancelled";
  });

  const openBooking = async (bookingId) => {
    const { data } = await api.get(`/bookings/${bookingId}`);
    setSelectedBooking(data);
  };

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading eyebrow="My Bookings" title="Booking history" subtitle="Tabs for upcoming, completed and cancelled rides." />
          <div className="tab-row">
            {["upcoming", "completed", "cancelled"].map((tab) => (
              <button key={tab} className={`tab-button ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)} type="button">
                {tab}
              </button>
            ))}
          </div>
          <div className="booking-list">
            {filtered.map((booking) => (
              <article className="booking-card" key={booking._id}>
                <div className="booking-card-head">
                  <div>
                    <strong>{booking.bookingId}</strong>
                    <p>
                      {booking.pickup} -&gt; {booking.destination}
                    </p>
                  </div>
                  <span className="badge">{booking.status}</span>
                </div>
                <p>
                  {booking.vehicleType} | Rs {booking.totalAmount} | {booking.paymentStatus}
                </p>
                <p>
                  {booking.bookingDate} {booking.bookingTime}
                </p>
                <div className="hero-actions">
                  <button className="ghost-button" type="button" onClick={() => openBooking(booking.bookingId)}>
                    View live status
                  </button>
                </div>
              </article>
            ))}
          </div>
          {selectedBooking ? (
            <div className="detail-panel">
              <h3>Live Tracking</h3>
              <StatusFlow currentStatus={selectedBooking.booking.status} bookingId={selectedBooking.booking.bookingId} />
              <div className="map-links">
                <a href={selectedBooking.maps.pickup} target="_blank" rel="noreferrer">Pickup location</a>
                <a href={selectedBooking.maps.destination} target="_blank" rel="noreferrer">Destination</a>
                <a href={selectedBooking.maps.route} target="_blank" rel="noreferrer">Route directions</a>
              </div>
              <div className="info-grid">
                <div className="mini-info">
                  <span>Driver</span>
                  <strong>{selectedBooking.booking.driver?.name || selectedBooking.booking.driverName || "Not assigned"}</strong>
                </div>
                <div className="mini-info">
                  <span>Contact</span>
                  <strong>{selectedBooking.booking.driver?.mobile || selectedBooking.booking.driverContact || "-"}</strong>
                </div>
                <div className="mini-info">
                  <span>Vehicle</span>
                  <strong>{selectedBooking.booking.driver?.vehicleNumber || selectedBooking.booking.driverVehicleNumber || "-"}</strong>
                </div>
                <div className="mini-info">
                  <span>ETA</span>
                  <strong>{selectedBooking.tracking.etaMinutes} min</strong>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </WebsiteShell>
  );
}

function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    api.get("/payments/mine").then((response) => setPayments(response.data.payments));
  }, []);

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading eyebrow="Payments" title="Payment history" subtitle="Track online and cash payment status in one place." />
          <div className="table-grid">
            {payments.map((payment) => (
              <article className="info-card" key={payment._id}>
                <span className="badge">{payment.status}</span>
                <h3>{payment.booking?.bookingId}</h3>
                <p>
                  {payment.booking?.pickup} -&gt; {payment.booking?.destination}
                </p>
                <p>Amount: Rs {payment.amount}</p>
                <p>Method: {payment.paymentMethod}</p>
                <p>Transaction: {payment.transactionId || "-"}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </WebsiteShell>
  );
}

function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    api.get("/notifications/mine").then((response) => setNotifications(response.data.notifications));
  }, []);

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading eyebrow="Notifications" title="Live alerts" subtitle="Booking updates, payment updates and travel alerts." />
          <div className="notification-list">
            {notifications.map((item) => (
              <article className={`notification-card ${item.read ? "read" : ""}`} key={item._id}>
                <span className="badge">{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </WebsiteShell>
  );
}

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "", language: "en" });
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "general", message: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    api.get("/profile").then((response) => {
      setProfile(response.data.user);
      setForm({
        name: response.data.user.name || "",
        phone: response.data.user.phone || "",
        address: response.data.user.address || "",
        language: response.data.user.language || "en"
      });
    });
    api.get("/profile/tickets").then((response) => setTickets(response.data.tickets));
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const saveProfile = async (event) => {
    event.preventDefault();
    const { data } = await api.put("/profile", form);
    setProfile(data.user);
    setUser(data.user);
    setMessage("Profile updated successfully.");
  };

  const submitTicket = async (event) => {
    event.preventDefault();
    const { data } = await api.post("/profile/tickets", ticketForm);
    setTickets((current) => [data.ticket, ...current]);
    setTicketForm({ subject: "", category: "general", message: "" });
    setMessage("Support ticket created.");
  };

  return (
    <WebsiteShell>
      <main className="page">
        <section className="section">
          <SectionHeading eyebrow="Profile" title="User profile and support" subtitle="Manage saved places and support requests." />
          <div className="profile-grid">
            <form className="auth-card" onSubmit={saveProfile}>
              <h3>Profile Details</h3>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
              <button className="primary-button" type="submit">
                Save Profile
              </button>
            </form>

            <div className="auth-card">
              <h3>Saved Places</h3>
              <ListingCardGrid items={profile?.favorites || []} emptyText="No saved listings yet." />
            </div>

            <form className="auth-card" onSubmit={submitTicket}>
              <h3>Support Ticket</h3>
              <input
                placeholder="Subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              />
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="driver">Driver</option>
              </select>
              <textarea
                rows="5"
                placeholder="Describe your issue"
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
              />
              <button className="primary-button" type="submit">
                Submit Ticket
              </button>
            </form>
          </div>

          <div className="section">
            <SectionHeading eyebrow="Tickets" title="Your support history" subtitle="Track open and resolved support tickets." />
            <div className="notification-list">
              {tickets.map((ticket) => (
                <article className="notification-card" key={ticket._id}>
                  <span className="badge">{ticket.status}</span>
                  <h3>{ticket.subject}</h3>
                  <p>{ticket.message}</p>
                  <p>Admin note: {ticket.adminNote || "Waiting for admin response."}</p>
                  {ticket.notesHistory?.length ? (
                    <div className="history-stack">
                      {ticket.notesHistory.slice(0, 3).map((note, index) => (
                        <p key={`${ticket._id}-${index}`}>
                          {new Date(note.createdAt).toLocaleString()} - {note.status || "note"}: {note.note}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
          {message ? <p className="status-line">{message}</p> : null}
        </section>
      </main>
    </WebsiteShell>
  );
}

function NotFound() {
  return (
    <WebsiteShell>
      <main className="auth-wrap">
        <div className="auth-card">
          <span className="pill">404</span>
          <h1>Page not found</h1>
          <p>The route you opened does not exist yet.</p>
          <Link className="primary-button" to="/">
            Go Home
          </Link>
        </div>
      </main>
    </WebsiteShell>
  );
}

function PaymentResultPage({ type }) {
  const location = useLocation();
  const bookingId = new URLSearchParams(location.search).get("booking");

  return (
    <WebsiteShell>
      <main className="auth-wrap">
        <div className="auth-card">
          <span className="pill">{type === "success" ? "Payment Complete" : "Payment Cancelled"}</span>
          <h1>{type === "success" ? "Your online payment was successful" : "Your payment was cancelled"}</h1>
          <p>
            {type === "success"
              ? "If the payment was successful, the booking will be updated automatically in the system."
              : "You can go back and choose pay later or try again."}
          </p>
          {type === "success" && bookingId ? <p>Booking reference: {bookingId}</p> : null}
          <div className="hero-actions">
            <Link className="primary-button" to="/dashboard">
              Go to Dashboard
            </Link>
            <Link className="ghost-button" to="/">
              Back Home
            </Link>
          </div>
        </div>
      </main>
    </WebsiteShell>
  );
}

export default function Website() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading Chalo Omkareshwar...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/driver-apply" element={<DriverApplyPage />} />
      <Route path="/driver/login" element={<DriverLoginPage />} />
      <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/hotels" element={<HotelPage />} />
      <Route path="/hotels/:slug" element={<HotelDetailRoute />} />
      <Route path="/dharamshalas" element={<DharamshalaPage />} />
      <Route path="/dharamshalas/:slug" element={<DharamshalaDetailRoute />} />
      <Route path="/restaurants" element={<RestaurantPage />} />
      <Route path="/restaurants/:slug" element={<RestaurantDetailRoute />} />
      <Route path="/temples" element={<TemplePage />} />
      <Route path="/temples/:slug" element={<TempleDetailRoute />} />
      <Route path="/travel-guide" element={<TravelGuidePage />} />
      <Route path="/attractions" element={<AttractionsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/indore-to-omkareshwar-cab" element={<SeoLandingPage />} />
      <Route path="/cheap-hotels-in-omkareshwar" element={<SeoLandingPage />} />
      <Route path="/best-dharamshala-in-omkareshwar" element={<SeoLandingPage />} />
      <Route path="/restaurants-near-omkareshwar-temple" element={<SeoLandingPage />} />
      <Route path="/seo/:slug" element={<SeoLandingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/book" element={<Navigate to="/dashboard" replace />} />
      <Route path="/payment/success" element={<PaymentResultPage type="success" />} />
      <Route path="/payment/cancelled" element={<PaymentResultPage type="cancelled" />} />
      <Route path="/category/:type" element={<CategoryPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
