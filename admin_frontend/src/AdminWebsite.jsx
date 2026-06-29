import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/client";
import { useAdminAuth } from "./context/AdminAuthContext";

const MEDIA_ORIGIN =
  import.meta.env.VITE_MEDIA_ORIGIN ||
  (import.meta.env.DEV ? "http://localhost:4001" : "");

function resolveMediaSrc(src = "") {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  if (src.startsWith("/uploads/") || src.startsWith("/images/")) {
    return `${MEDIA_ORIGIN}${src}`;
  }
  return src;
}

function Shell({ children }) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  const goBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }
    navigate("/dashboard");
  };

  const pageTitleMap = {
    "/dashboard": "Dashboard",
    "/pricing": "Price Management",
    "/users": "Users",
    "/drivers": "Drivers",
    "/bookings": "Bookings",
    "/payments": "Payments",
    "/tickets": "Support Tickets",
    "/listings": "Listings",
    "/settings": "Settings"
  };
  const pageTitle = pageTitleMap[location.pathname] || "Admin";

  return (
    <div className="website-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">CO</div>
          <div>
            <h1>Admin Website</h1>
            <p>Chalo Omkareshwar</p>
          </div>
        </div>
        {user ? <div className="admin-chip">{user.email}</div> : null}
        <nav className="side-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/pricing">Price Management</Link>
          <Link to="/users">Users</Link>
          <Link to="/drivers">Drivers</Link>
          <Link to="/bookings">Bookings</Link>
          <Link to="/payments">Payments</Link>
          <Link to="/tickets">Support Tickets</Link>
          <Link to="/listings">Listings</Link>
          <Link to="/settings">Settings</Link>
        </nav>
        {user ? (
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        ) : null}
      </aside>
      <main className="main-panel">
        <div className="admin-page-topbar">
          <button className="back-button" type="button" onClick={goBack}>
            Back
          </button>
          <div className="admin-page-title">
            <span className="eyebrow">Admin</span>
            <h2>{pageTitle}</h2>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function LoginPage() {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth.user) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      await auth.login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">Secure access</span>
        <h2>Admin login</h2>
        <p>Manage users, drivers, bookings and platform content.</p>
        <input placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="action-button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </div>
  );
}

function SettingsPage() {
  const auth = useAdminAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation must match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put("/admin/settings/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setMessage(data.message || "Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">Settings</span>
            <h3>Admin password management</h3>
          </div>
        </div>
        <form className="admin-form settings-form" onSubmit={submit}>
          <input
            type="password"
            placeholder="Current password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
          <input
            type="password"
            placeholder="New password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <button className="action-button" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
          {message ? <p className="status-line">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </section>
    </Shell>
  );
}

function DashboardPage({ view = "dashboard" }) {
  const auth = useAdminAuth();
  const show = (key) => view === "all" || view === key || (view === "dashboard" && key === "dashboard");
  const [summary, setSummary] = useState({});
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketNotes, setTicketNotes] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewReplies, setReviewReplies] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [listings, setListings] = useState([]);
  const [editingListingId, setEditingListingId] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [listingPreview, setListingPreview] = useState({ imageUrl: "", gallery: [] });
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    category: "Travel Guides",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    published: true,
    featured: false
  });
  const [listingForm, setListingForm] = useState({
    type: "hotel",
    name: "",
    slug: "",
    category: "",
    city: "Omkareshwar",
    location: "",
    address: "",
    description: "",
    longDescription: "",
    price: 0,
    priceRange: "",
    numberOfRooms: 0,
    rating: 4.5,
    featured: true,
    availabilityStatus: "available",
    contact: "",
    contactNumber: "",
    whatsappNumber: "",
    mapsLocation: "",
    website: "",
    cuisineType: "",
    averageCost: "",
    openingTime: "",
    closingTime: "",
    history: "",
    importance: "",
    timings: "",
    aartiTimings: "",
    distanceFromTemple: "",
    facilities: "",
    amenities: "",
    roomTypes: "",
    nearbyAttractions: "",
    nearbyHotels: "",
    nearbyRestaurants: "",
    nearbyTemples: "",
    menuHighlights: "",
    imageUrl: "",
    gallery: [],
    metaTitle: "",
    metaDescription: ""
  });

  const loadAll = async () => {
    const [summaryRes, usersRes, driversRes, bookingsRes, listingsRes] = await Promise.all([
      api.get("/admin/dashboard/summary"),
      api.get("/admin/dashboard/users"),
      api.get("/admin/dashboard/drivers"),
      api.get("/admin/dashboard/bookings"),
      api.get("/admin/listings")
    ]);

    setSummary(summaryRes.data.stats);
    setUsers(usersRes.data.users);
    setDrivers(driversRes.data.drivers);
    setBookings(bookingsRes.data.bookings);
    setListings(listingsRes.data.listings);
    const [paymentsRes, notificationsRes] = await Promise.all([
      api.get("/admin/dashboard/payments"),
      api.get("/admin/dashboard/notifications")
    ]);
    const [ticketsRes, pricingRes] = await Promise.all([
      api.get("/admin/dashboard/tickets"),
      api.get("/admin/pricing")
    ]);
    const [blogsRes, reviewsRes] = await Promise.all([api.get("/admin/blogs"), api.get("/admin/reviews")]);
    setPayments(paymentsRes.data.payments);
    setNotifications(notificationsRes.data.notifications);
    setTickets(ticketsRes.data.tickets);
    setPricing(pricingRes.data.pricing);
    setBlogs(blogsRes.data.blogs);
    setReviews(reviewsRes.data.reviews);
    setReviewReplies(
      Object.fromEntries((reviewsRes.data.reviews || []).map((item) => [item._id, item.adminReply || ""]))
    );
  };

  useEffect(() => {
    if (auth.user) {
      loadAll();
    }
  }, [auth.user]);

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  const splitList = (value) =>
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });

  const uploadFileToServer = async (file, prefix) => {
    const dataUrl = await readFileAsDataUrl(file);
    const { data } = await api.post("/admin/uploads/image", {
      dataUrl,
      filename: `${prefix}-${file.name || "image"}`
    });
    return data.url;
  };

  const createListing = async (event) => {
    event.preventDefault();
    const payload = {
      ...listingForm,
      gallery: Array.isArray(listingForm.gallery) ? listingForm.gallery : [],
      facilities: splitList(listingForm.facilities),
      amenities: splitList(listingForm.amenities),
      roomTypes: splitList(listingForm.roomTypes),
      nearbyAttractions: splitList(listingForm.nearbyAttractions),
      nearbyHotels: splitList(listingForm.nearbyHotels),
      nearbyRestaurants: splitList(listingForm.nearbyRestaurants),
      nearbyTemples: splitList(listingForm.nearbyTemples),
      menuHighlights: splitList(listingForm.menuHighlights)
    };
    if (editingListingId) {
      await api.put(`/admin/listings/${editingListingId}`, payload);
    } else {
      await api.post("/admin/listings", payload);
    }
    setListingForm({
      type: "hotel",
      name: "",
      slug: "",
      category: "",
      city: "Omkareshwar",
      location: "",
      address: "",
      description: "",
      longDescription: "",
      price: 0,
      priceRange: "",
      numberOfRooms: 0,
      rating: 4.5,
      featured: true,
      availabilityStatus: "available",
      contact: "",
      contactNumber: "",
      whatsappNumber: "",
      mapsLocation: "",
      website: "",
      cuisineType: "",
      averageCost: "",
      openingTime: "",
      closingTime: "",
      history: "",
      importance: "",
      timings: "",
      aartiTimings: "",
      distanceFromTemple: "",
      facilities: "",
      amenities: "",
      roomTypes: "",
      nearbyAttractions: "",
      nearbyHotels: "",
      nearbyRestaurants: "",
      nearbyTemples: "",
      menuHighlights: "",
      imageUrl: "",
      gallery: [],
      metaTitle: "",
      metaDescription: ""
    });
    setEditingListingId(null);
    setListingPreview({ imageUrl: "", gallery: [] });
    await loadAll();
  };

  const createBlog = async (event) => {
    event.preventDefault();
    const payload = {
      ...blogForm,
      tags: splitList(blogForm.tags)
    };
    if (editingBlogId) {
      await api.put(`/admin/blogs/${editingBlogId}`, payload);
    } else {
      await api.post("/admin/blogs", payload);
    }
    setBlogForm({
      title: "",
      slug: "",
      category: "Travel Guides",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      seoTitle: "",
      seoDescription: "",
      published: true,
      featured: false
    });
    setEditingBlogId(null);
    await loadAll();
  };

  const updateBlog = async (id, payload) => {
    await api.put(`/admin/blogs/${id}`, payload);
    await loadAll();
  };

  const deleteBlog = async (id) => {
    await api.delete(`/admin/blogs/${id}`);
    await loadAll();
  };

  const editListing = (item) => {
    setEditingListingId(item._id);
    setListingForm({
      type: item.type || "hotel",
      name: item.name || "",
      slug: item.slug || "",
      category: item.category || "",
      city: item.city || "Omkareshwar",
      location: item.location || "",
      address: item.address || "",
      description: item.description || "",
      longDescription: item.longDescription || "",
      price: item.price || 0,
      priceRange: item.priceRange || "",
      numberOfRooms: item.numberOfRooms || 0,
      rating: item.rating || 4.5,
      featured: !!item.featured,
      availabilityStatus: item.availabilityStatus || "available",
      contact: item.contact || "",
      contactNumber: item.contactNumber || "",
      whatsappNumber: item.whatsappNumber || "",
      mapsLocation: item.mapsLocation || "",
      website: item.website || "",
      cuisineType: item.cuisineType || "",
      averageCost: item.averageCost || "",
      openingTime: item.openingTime || "",
      closingTime: item.closingTime || "",
      history: item.history || "",
      importance: item.importance || "",
      timings: item.timings || "",
      aartiTimings: item.aartiTimings || "",
      distanceFromTemple: item.distanceFromTemple || "",
      facilities: (item.facilities || []).join(", "),
      amenities: (item.amenities || []).join(", "),
      roomTypes: (item.roomTypes || []).join(", "),
      nearbyAttractions: (item.nearbyAttractions || []).join(", "),
      nearbyHotels: (item.nearbyHotels || []).join(", "),
      nearbyRestaurants: (item.nearbyRestaurants || []).join(", "),
      nearbyTemples: (item.nearbyTemples || []).join(", "),
      menuHighlights: (item.menuHighlights || []).join(", "),
      imageUrl: item.imageUrl || "",
      gallery: item.gallery || [],
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || ""
    });
    setListingPreview({ imageUrl: item.imageUrl || "", gallery: item.gallery || [] });
  };

  const editBlog = (item) => {
    setEditingBlogId(item._id);
    setBlogForm({
      title: item.title || "",
      slug: item.slug || "",
      category: item.category || "Travel Guides",
      excerpt: item.excerpt || "",
      content: item.content || "",
      coverImage: item.coverImage || "",
      tags: (item.tags || []).join(", "),
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
      published: item.published ?? true,
      featured: item.featured ?? false
    });
  };

  const updateReview = async (id, status) => {
    await api.patch(`/admin/reviews/${id}`, {
      status,
      adminReply: reviewReplies[id] ?? ""
    });
    await loadAll();
  };

  const saveReviewReply = async (id) => {
    await api.patch(`/admin/reviews/${id}`, {
      adminReply: reviewReplies[id] ?? ""
    });
    await loadAll();
  };

  const deleteReview = async (id) => {
    await api.delete(`/admin/reviews/${id}`);
    await loadAll();
  };

  const updateBooking = async (id, status) => {
    await api.patch(`/admin/dashboard/bookings/${id}`, { status });
    await loadAll();
  };

  const updateDriver = async (id, status) => {
    await api.patch(`/admin/dashboard/drivers/${id}`, { status });
    await loadAll();
  };

  const toggleFeatured = async (item) => {
    const { _id, createdAt, updatedAt, __v, ...rest } = item;
    await api.put(`/admin/listings/${item._id}`, { ...rest, featured: !item.featured });
    await loadAll();
  };

  const deleteListing = async (id) => {
    await api.delete(`/admin/listings/${id}`);
    await loadAll();
  };

  const updatePricing = async (payload) => {
    await api.put("/admin/pricing", payload);
    await loadAll();
  };

  const updateTicket = async (id, status, adminNote) => {
    await api.patch(`/admin/dashboard/tickets/${id}`, {
      status,
      adminNote: adminNote || ""
    });
    setTicketNotes((current) => ({ ...current, [id]: "" }));
    await loadAll();
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((item) => Math.round(Number(item.rating || 0)) === rating).length;
    return { rating, count };
  });
  const averageRating = reviews.length
    ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";
  const approvedReviews = reviews.filter((item) => item.status === "approved").length;
  const pendingReviews = reviews.filter((item) => item.status === "pending").length;

  return (
    <Shell>
      {show("pricing") ? (
      <section className="section-block" id="pricing">
        <div className="section-head">
          <div>
            <span className="eyebrow">Price Management</span>
            <h3>Per kilometer fare control</h3>
          </div>
        </div>
        {pricing ? (
          <div className="pricing-grid">
            {["bike", "auto", "cab", "traveller"].map((type) => (
              <article className="pricing-card" key={type}>
                <h4>{type.toUpperCase()}</h4>
                <label>
                  Base Fare
                  <input
                    type="number"
                    value={pricing.baseFares?.[type] ?? 0}
                    onChange={(e) =>
                      setPricing((current) => ({
                        ...current,
                        baseFares: { ...current.baseFares, [type]: Number(e.target.value) }
                      }))
                    }
                  />
                </label>
                <label>
                  Per KM
                  <input
                    type="number"
                    value={pricing.perKmRates?.[type] ?? 0}
                    onChange={(e) =>
                      setPricing((current) => ({
                        ...current,
                        perKmRates: { ...current.perKmRates, [type]: Number(e.target.value) }
                      }))
                    }
                  />
                </label>
                <label>
                  Convenience Fee
                  <input
                    type="number"
                    value={pricing.convenienceFees?.[type] ?? 0}
                    onChange={(e) =>
                      setPricing((current) => ({
                        ...current,
                        convenienceFees: { ...current.convenienceFees, [type]: Number(e.target.value) }
                      }))
                    }
                  />
                </label>
                <label>
                  ETA Minutes
                  <input
                    type="number"
                    value={pricing.etaMinutes?.[type] ?? 0}
                    onChange={(e) =>
                      setPricing((current) => ({
                        ...current,
                        etaMinutes: { ...current.etaMinutes, [type]: Number(e.target.value) }
                      }))
                    }
                  />
                </label>
                <button
                  className="action-button"
                  type="button"
                  onClick={() =>
                    updatePricing({
                      ...pricing,
                      key: "default"
                    })
                  }
                >
                  Save {type}
                </button>
              </article>
            ))}
            <article className="pricing-card">
              <h4>Global Settings</h4>
              <label>
                Taxes %
                <input
                  type="number"
                  value={pricing.taxesPercent ?? 5}
                  onChange={(e) => setPricing((current) => ({ ...current, taxesPercent: Number(e.target.value) }))}
                />
              </label>
              <label>
                Currency
                <input
                  value={pricing.currency ?? "inr"}
                  onChange={(e) => setPricing((current) => ({ ...current, currency: e.target.value }))}
                />
              </label>
              <button className="action-button" type="button" onClick={() => updatePricing({ ...pricing, key: "default" })}>
                Save Global Settings
              </button>
            </article>
          </div>
        ) : null}
      </section>
      ) : null}

      {show("dashboard") ? (
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Admin dashboard</span>
          <h2>Platform control center</h2>
          <p>Monitor user growth, manage bookings and control all public listings from one screen.</p>
        </div>
        <div className="stat-row">
          <StatCard label="Users" value={summary.users ?? 0} />
          <StatCard label="Bookings" value={summary.bookings ?? 0} />
          <StatCard label="Listings" value={summary.listings ?? 0} />
          <StatCard label="Drivers" value={summary.drivers ?? 0} />
          <StatCard label="Active Drivers" value={summary.activeDrivers ?? 0} />
          <StatCard label="Pending Approvals" value={summary.pendingApprovals ?? 0} />
          <StatCard label="Hotels" value={summary.hotels ?? 0} />
          <StatCard label="Restaurants" value={summary.restaurants ?? 0} />
          <StatCard label="Temples" value={summary.temples ?? 0} />
          <StatCard label="Reviews" value={summary.reviews ?? 0} />
          <StatCard label="Monthly Revenue" value={`Rs ${summary.monthlyRevenue ?? 0}`} />
          <StatCard label="Total Revenue" value={`Rs ${summary.totalRevenue ?? 0}`} />
        </div>
      </section>
      ) : null}

      {show("listings") ? (
      <section className="section-block" id="listings">
        <div className="section-head">
          <div>
            <span className="eyebrow">Listings manager</span>
            <h3>Create and manage local services</h3>
          </div>
        </div>
        <form className="admin-form" onSubmit={createListing}>
          <select value={listingForm.type} onChange={(e) => setListingForm({ ...listingForm, type: e.target.value })}>
            <option value="hotel">Hotel</option>
            <option value="dharamshala">Dharamshala</option>
            <option value="temple">Temple</option>
            <option value="restaurant">Restaurant</option>
            <option value="route">Route</option>
            <option value="service">Service</option>
          </select>
          <input placeholder="Name" value={listingForm.name} onChange={(e) => setListingForm({ ...listingForm, name: e.target.value })} />
          <input placeholder="Slug" value={listingForm.slug} onChange={(e) => setListingForm({ ...listingForm, slug: e.target.value })} />
          <input placeholder="Category" value={listingForm.category} onChange={(e) => setListingForm({ ...listingForm, category: e.target.value })} />
          <input placeholder="City" value={listingForm.city} onChange={(e) => setListingForm({ ...listingForm, city: e.target.value })} />
          <input
            placeholder="Location"
            value={listingForm.location}
            onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })}
          />
          <input placeholder="Address" value={listingForm.address} onChange={(e) => setListingForm({ ...listingForm, address: e.target.value })} />
          <input
            placeholder="Description"
            value={listingForm.description}
            onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
          />
          <input
            placeholder="Long Description"
            value={listingForm.longDescription}
            onChange={(e) => setListingForm({ ...listingForm, longDescription: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={listingForm.price}
            onChange={(e) => setListingForm({ ...listingForm, price: Number(e.target.value) })}
          />
          <input
            placeholder="Price Range"
            value={listingForm.priceRange}
            onChange={(e) => setListingForm({ ...listingForm, priceRange: e.target.value })}
          />
          <input
            type="number"
            placeholder="Number of Rooms"
            value={listingForm.numberOfRooms}
            onChange={(e) => setListingForm({ ...listingForm, numberOfRooms: Number(e.target.value) })}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Rating"
            value={listingForm.rating}
            onChange={(e) => setListingForm({ ...listingForm, rating: Number(e.target.value) })}
          />
          <input
            placeholder="Availability Status"
            value={listingForm.availabilityStatus}
            onChange={(e) => setListingForm({ ...listingForm, availabilityStatus: e.target.value })}
          />
          <input
            placeholder="Contact"
            value={listingForm.contact}
            onChange={(e) => setListingForm({ ...listingForm, contact: e.target.value })}
          />
          <input
            placeholder="Contact Number"
            value={listingForm.contactNumber}
            onChange={(e) => setListingForm({ ...listingForm, contactNumber: e.target.value })}
          />
          <input
            placeholder="WhatsApp Number"
            value={listingForm.whatsappNumber}
            onChange={(e) => setListingForm({ ...listingForm, whatsappNumber: e.target.value })}
          />
          <input
            placeholder="Maps Location"
            value={listingForm.mapsLocation}
            onChange={(e) => setListingForm({ ...listingForm, mapsLocation: e.target.value })}
          />
          <input
            placeholder="Website"
            value={listingForm.website}
            onChange={(e) => setListingForm({ ...listingForm, website: e.target.value })}
          />
          <input
            placeholder="Cuisine Type"
            value={listingForm.cuisineType}
            onChange={(e) => setListingForm({ ...listingForm, cuisineType: e.target.value })}
          />
          <input
            placeholder="Average Cost"
            value={listingForm.averageCost}
            onChange={(e) => setListingForm({ ...listingForm, averageCost: e.target.value })}
          />
          <input
            placeholder="Opening Time"
            value={listingForm.openingTime}
            onChange={(e) => setListingForm({ ...listingForm, openingTime: e.target.value })}
          />
          <input
            placeholder="Closing Time"
            value={listingForm.closingTime}
            onChange={(e) => setListingForm({ ...listingForm, closingTime: e.target.value })}
          />
          <input placeholder="History" value={listingForm.history} onChange={(e) => setListingForm({ ...listingForm, history: e.target.value })} />
          <input
            placeholder="Importance"
            value={listingForm.importance}
            onChange={(e) => setListingForm({ ...listingForm, importance: e.target.value })}
          />
          <input placeholder="Timings" value={listingForm.timings} onChange={(e) => setListingForm({ ...listingForm, timings: e.target.value })} />
          <input
            placeholder="Aarti Timings"
            value={listingForm.aartiTimings}
            onChange={(e) => setListingForm({ ...listingForm, aartiTimings: e.target.value })}
          />
          <input
            placeholder="Distance From Temple"
            value={listingForm.distanceFromTemple}
            onChange={(e) => setListingForm({ ...listingForm, distanceFromTemple: e.target.value })}
          />
          <input
            placeholder="Facilities (comma separated)"
            value={listingForm.facilities}
            onChange={(e) => setListingForm({ ...listingForm, facilities: e.target.value })}
          />
          <input
            placeholder="Amenities (comma separated)"
            value={listingForm.amenities}
            onChange={(e) => setListingForm({ ...listingForm, amenities: e.target.value })}
          />
          <input
            placeholder="Room Types (comma separated)"
            value={listingForm.roomTypes}
            onChange={(e) => setListingForm({ ...listingForm, roomTypes: e.target.value })}
          />
          <input
            placeholder="Nearby Attractions (comma separated)"
            value={listingForm.nearbyAttractions}
            onChange={(e) => setListingForm({ ...listingForm, nearbyAttractions: e.target.value })}
          />
          <input
            placeholder="Nearby Hotels (comma separated)"
            value={listingForm.nearbyHotels}
            onChange={(e) => setListingForm({ ...listingForm, nearbyHotels: e.target.value })}
          />
          <input
            placeholder="Nearby Restaurants (comma separated)"
            value={listingForm.nearbyRestaurants}
            onChange={(e) => setListingForm({ ...listingForm, nearbyRestaurants: e.target.value })}
          />
          <input
            placeholder="Nearby Temples (comma separated)"
            value={listingForm.nearbyTemples}
            onChange={(e) => setListingForm({ ...listingForm, nearbyTemples: e.target.value })}
          />
          <input
            placeholder="Menu Highlights (comma separated)"
            value={listingForm.menuHighlights}
            onChange={(e) => setListingForm({ ...listingForm, menuHighlights: e.target.value })}
          />
          <input
            placeholder="Image URL"
            value={listingForm.imageUrl}
            onChange={(e) => setListingForm({ ...listingForm, imageUrl: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const imageUrl = await uploadFileToServer(file, "listing");
              setListingForm((current) => ({ ...current, imageUrl }));
              setListingPreview((current) => ({ ...current, imageUrl }));
              e.target.value = "";
            }}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (!files.length) return;
              const gallery = await Promise.all(files.map((file) => uploadFileToServer(file, "gallery")));
              setListingForm((current) => ({ ...current, gallery }));
              setListingPreview((current) => ({ ...current, gallery }));
              e.target.value = "";
            }}
          />
          {listingPreview.imageUrl ? (
            <img className="listing-preview" src={resolveMediaSrc(listingPreview.imageUrl)} alt="Listing preview" />
          ) : null}
          <input
            placeholder="Meta Title"
            value={listingForm.metaTitle}
            onChange={(e) => setListingForm({ ...listingForm, metaTitle: e.target.value })}
          />
          <input
            placeholder="Meta Description"
            value={listingForm.metaDescription}
            onChange={(e) => setListingForm({ ...listingForm, metaDescription: e.target.value })}
          />
          <button className="action-button" type="submit">
            {editingListingId ? "Update Listing" : "Add Listing"}
          </button>
          {editingListingId ? (
            <button
              className="mini-button"
              type="button"
              onClick={() => {
                setEditingListingId(null);
                setListingForm({
                  type: "hotel",
                  name: "",
                  slug: "",
                  category: "",
                  city: "Omkareshwar",
                  location: "",
                  address: "",
                  description: "",
                  longDescription: "",
                  price: 0,
                  priceRange: "",
                  numberOfRooms: 0,
                  rating: 4.5,
                  featured: true,
                  availabilityStatus: "available",
                  contact: "",
                  contactNumber: "",
                  whatsappNumber: "",
                  mapsLocation: "",
                  website: "",
                  cuisineType: "",
                  averageCost: "",
                  openingTime: "",
                  closingTime: "",
                  history: "",
                  importance: "",
                  timings: "",
                  aartiTimings: "",
                  distanceFromTemple: "",
                  facilities: "",
                  amenities: "",
                  roomTypes: "",
                  nearbyAttractions: "",
                  nearbyHotels: "",
                  nearbyRestaurants: "",
                  nearbyTemples: "",
                  menuHighlights: "",
                  imageUrl: "",
                  gallery: [],
                  metaTitle: "",
                  metaDescription: ""
                });
                setListingPreview({ imageUrl: "", gallery: [] });
              }}
            >
              Cancel
            </button>
          ) : null}
        </form>

        <div className="table-grid">
          {listings.map((item) => (
            <article className="table-card" key={item._id}>
              <div className="table-card-top">
                <span className="badge">{item.type}</span>
                <strong>{item.featured ? "Featured" : "Normal"}</strong>
              </div>
              {item.imageUrl || item.gallery?.[0] ? (
                <img
                  className="listing-preview"
                  src={resolveMediaSrc(item.imageUrl || item.gallery?.[0])}
                  alt={item.name}
                />
              ) : null}
              <h4>{item.name}</h4>
              <p>{item.location}</p>
              <p>{item.description}</p>
              <div className="table-actions">
                <button className="mini-button" onClick={() => editListing(item)} type="button">
                  Edit
                </button>
                <button className="mini-button" onClick={() => toggleFeatured(item)} type="button">
                  Toggle Featured
                </button>
                <button className="mini-button danger" onClick={() => deleteListing(item._id)} type="button">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {show("bookings") ? (
      <section className="section-block" id="bookings">
        <div className="section-head">
          <div>
            <span className="eyebrow">Bookings</span>
            <h3>Live booking approvals</h3>
          </div>
        </div>
        <div className="table-list">
          {bookings.map((item) => (
            <article className="list-row" key={item._id}>
              <div>
                <strong>
                    {item.bookingId} | {item.pickup} -&gt; {item.destination}
                </strong>
                <p>
                  {item.vehicleType} | Rs {item.totalAmount} | {item.status} | {item.paymentStatus}
                </p>
                <span>
                  {item.user?.name || "Unknown user"} - {item.user?.email || "No email"} - ETA {item.estimatedTimeMinutes} min
                </span>
              </div>
              <div className="table-actions">
                <button className="mini-button" onClick={() => updateBooking(item._id, "accepted")} type="button">
                  Accept
                </button>
                <button className="mini-button" onClick={() => updateBooking(item._id, "driver_assigned")} type="button">
                  Assign
                </button>
                <button className="mini-button" onClick={() => updateBooking(item._id, "driver_reached")} type="button">
                  Reached
                </button>
                <button className="mini-button" onClick={() => updateBooking(item._id, "ride_started")} type="button">
                  Start
                </button>
                <button className="mini-button" onClick={() => updateBooking(item._id, "ride_completed")} type="button">
                  Complete
                </button>
                <button className="mini-button" onClick={() => updateBooking(item._id, "payment_settled")} type="button">
                  Settle
                </button>
                <button className="mini-button danger" onClick={() => updateBooking(item._id, "cancelled")} type="button">
                  Cancel
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {show("users") ? (
      <section className="section-block" id="users">
        <div className="section-head">
          <div>
            <span className="eyebrow">Users</span>
            <h3>Registered travelers</h3>
          </div>
        </div>
        <div className="table-list">
          {users.map((item) => (
            <article className="list-row" key={item._id}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.email}</p>
              </div>
              <span className="badge">{item.role}</span>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {show("drivers") ? (
      <section className="section-block" id="drivers">
        <div className="section-head">
          <div>
            <span className="eyebrow">Drivers</span>
            <h3>Driver accounts</h3>
          </div>
        </div>
        <div className="table-list">
          {drivers.length ? (
            drivers.map((item) => (
              <article className="list-row" key={item._id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.email} | {item.vehicleType} | {item.vehicleNumber}
                  </p>
                  <span>
                    Status: {item.status} | Rating: {item.rating} | Rides: {item.totalRides}
                  </span>
                </div>
                <div className="table-actions">
                  <button className="mini-button" type="button" onClick={() => updateDriver(item._id, "under_review")}>
                    Review
                  </button>
                  <button className="mini-button" type="button" onClick={() => updateDriver(item._id, "approved")}>
                    Approve
                  </button>
                  <button className="mini-button" type="button" onClick={() => updateDriver(item._id, "active")}>
                    Activate
                  </button>
                  <button className="mini-button danger" type="button" onClick={() => updateDriver(item._id, "rejected")}>
                    Reject
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-box">No driver accounts yet.</div>
          )}
        </div>
      </section>
      ) : null}

      {show("payments") ? (
      <section className="section-block" id="payments">
        <div className="section-head">
          <div>
            <span className="eyebrow">Payments</span>
            <h3>Payment records</h3>
          </div>
        </div>
        <div className="table-list">
          {payments.map((item) => (
            <article className="list-row" key={item._id}>
              <div>
                <strong>{item.booking?.bookingId}</strong>
                <p>
                  {item.booking?.pickup} -&gt; {item.booking?.destination}
                </p>
                <span>
                  Rs {item.amount} | {item.paymentMethod} | {item.status} | {item.transactionId || "pending"}
                </span>
              </div>
              <span className="badge">{item.provider}</span>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {show("tickets") ? (
      <section className="section-block" id="tickets">
        <div className="section-head">
          <div>
            <span className="eyebrow">Support Tickets</span>
            <h3>User help desk</h3>
          </div>
        </div>
        <div className="table-list">
          {tickets.map((item) => (
            <article className="list-row" key={item._id}>
              <div>
                <strong>{item.subject}</strong>
                <p>{item.message}</p>
                <span>
                  {item.user?.name} | {item.user?.email}
                </span>
                <p>Status: {item.status}</p>
                <p>Admin note: {item.adminNote || "No note added yet."}</p>
                {item.notesHistory?.length ? (
                  <div className="history-stack">
                    {item.notesHistory.slice(0, 3).map((note, index) => (
                      <p key={`${item._id}-${index}`}>
                        {new Date(note.createdAt).toLocaleString()} - {note.status || "note"}: {note.note}
                      </p>
                    ))}
                  </div>
                ) : null}
                <textarea
                  rows="3"
                  placeholder="Add admin note"
                  value={ticketNotes[item._id] || ""}
                  onChange={(e) => setTicketNotes((current) => ({ ...current, [item._id]: e.target.value }))}
                />
              </div>
              <div className="table-actions">
                <button
                  className="mini-button"
                  type="button"
                  onClick={() => updateTicket(item._id, "open", ticketNotes[item._id])}
                >
                  Save Note
                </button>
                <button
                  className="mini-button"
                  type="button"
                  onClick={() => updateTicket(item._id, "in_progress", ticketNotes[item._id])}
                >
                  In Progress
                </button>
                <button
                  className="mini-button"
                  type="button"
                  onClick={() => updateTicket(item._id, "resolved", ticketNotes[item._id])}
                >
                  Resolve
                </button>
                <button
                  className="mini-button danger"
                  type="button"
                  onClick={() => updateTicket(item._id, "closed", ticketNotes[item._id])}
                >
                  Close
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {show("dashboard") ? (
      <section className="section-block" id="notifications">
        <div className="section-head">
          <div>
            <span className="eyebrow">Notifications</span>
            <h3>Platform alerts</h3>
          </div>
        </div>
        <div className="table-list">
          {notifications.map((item) => (
            <article className="list-row" key={item._id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <span>{item.type}</span>
              </div>
              <span className="badge">{item.audience}</span>
            </article>
          ))}
        </div>
      </section>
      ) : null}
      {show("dashboard") ? (
      <section className="section-block" id="blogs">
        <div className="section-head">
          <div>
            <span className="eyebrow">Blog System</span>
            <h3>SEO articles and travel posts</h3>
          </div>
        </div>
        <form className="admin-form" onSubmit={createBlog}>
          <input placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} />
          <input placeholder="Slug" value={blogForm.slug} onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })} />
          <input placeholder="Category" value={blogForm.category} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })} />
          <input placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} />
          <textarea rows="4" placeholder="Content" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} />
          <input
            placeholder="Cover Image URL"
            value={blogForm.coverImage}
            onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const coverImage = await uploadFileToServer(file, "blog");
              setBlogForm((current) => ({ ...current, coverImage }));
              e.target.value = "";
            }}
          />
          <input placeholder="Tags comma separated" value={blogForm.tags} onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })} />
          <input placeholder="SEO Title" value={blogForm.seoTitle} onChange={(e) => setBlogForm({ ...blogForm, seoTitle: e.target.value })} />
          <input placeholder="SEO Description" value={blogForm.seoDescription} onChange={(e) => setBlogForm({ ...blogForm, seoDescription: e.target.value })} />
          <select value={blogForm.published ? "true" : "false"} onChange={(e) => setBlogForm({ ...blogForm, published: e.target.value === "true" })}>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
          <select value={blogForm.featured ? "true" : "false"} onChange={(e) => setBlogForm({ ...blogForm, featured: e.target.value === "true" })}>
            <option value="true">Featured</option>
            <option value="false">Normal</option>
          </select>
          <button className="action-button" type="submit">
            {editingBlogId ? "Update Blog" : "Add Blog"}
          </button>
          {editingBlogId ? (
            <button
              className="mini-button"
              type="button"
              onClick={() => {
                setEditingBlogId(null);
                setBlogForm({
                  title: "",
                  slug: "",
                  category: "Travel Guides",
                  excerpt: "",
                  content: "",
                  coverImage: "",
                  tags: "",
                  seoTitle: "",
                  seoDescription: "",
                  published: true,
                  featured: false
                });
              }}
            >
              Cancel
            </button>
          ) : null}
        </form>
        <div className="table-list">
          {blogs.map((item) => (
            <article className="list-row" key={item._id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.excerpt}</p>
                <span>
                  {item.category} | {item.published ? "Published" : "Draft"} | {item.featured ? "Featured" : "Normal"}
                </span>
              </div>
              <div className="table-actions">
                <button className="mini-button" type="button" onClick={() => editBlog(item)}>
                  Edit
                </button>
                <button className="mini-button" type="button" onClick={() => updateBlog(item._id, { featured: !item.featured })}>
                  Toggle Featured
                </button>
                <button className="mini-button" type="button" onClick={() => updateBlog(item._id, { published: !item.published })}>
                  Toggle Publish
                </button>
                <button className="mini-button danger" type="button" onClick={() => deleteBlog(item._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {show("dashboard") ? (
      <section className="section-block" id="reviews">
        <div className="section-head">
          <div>
            <span className="eyebrow">Review Moderation</span>
            <h3>Listing reviews</h3>
          </div>
        </div>
        <div className="rating-analytics">
          <article className="rating-summary-card">
            <span>Average Rating</span>
            <strong>{averageRating}/5</strong>
            <p>{reviews.length} total reviews</p>
          </article>
          <article className="rating-summary-card">
            <span>Approved</span>
            <strong>{approvedReviews}</strong>
            <p>Visible on the public site</p>
          </article>
          <article className="rating-summary-card">
            <span>Pending</span>
            <strong>{pendingReviews}</strong>
            <p>Waiting for admin review</p>
          </article>
        </div>
        <div className="rating-chart">
          {ratingDistribution.map((item) => {
            const max = Math.max(...ratingDistribution.map((entry) => entry.count), 1);
            const width = `${(item.count / max) * 100}%`;
            return (
              <div className="rating-bar-row" key={item.rating}>
                <span>{item.rating} star</span>
                <div className="rating-bar-track">
                  <div className="rating-bar-fill" style={{ width }} />
                </div>
                <strong>{item.count}</strong>
              </div>
            );
          })}
        </div>
        <div className="table-list">
          {reviews.map((item) => (
            <article className="list-row" key={item._id}>
              <div>
                <strong>{item.authorName}</strong>
                <p>
                  {item.listing?.name || "Unknown listing"} | Rating: {item.rating}
                </p>
                <span>{item.comment}</span>
                <textarea
                  rows="3"
                  className="admin-reply-input"
                  placeholder="Admin reply"
                  value={reviewReplies[item._id] ?? ""}
                  onChange={(e) => setReviewReplies((current) => ({ ...current, [item._id]: e.target.value }))}
                />
                {item.adminReply ? <span className="reply-hint">Current reply: {item.adminReply}</span> : null}
              </div>
              <div className="table-actions">
                <button className="mini-button" type="button" onClick={() => saveReviewReply(item._id)}>
                  Save Reply
                </button>
                <button className="mini-button" type="button" onClick={() => updateReview(item._id, "approved")}>
                  Approve
                </button>
                <button className="mini-button" type="button" onClick={() => updateReview(item._id, "pending")}>
                  Pending
                </button>
                <button className="mini-button danger" type="button" onClick={() => deleteReview(item._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}
    </Shell>
  );
}

function AdminWebsite() {
  const { loading } = useAdminAuth();

  if (loading) {
    return <div className="loading-state">Loading admin panel...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage view="dashboard" />} />
      <Route path="/pricing" element={<DashboardPage view="pricing" />} />
      <Route path="/users" element={<DashboardPage view="users" />} />
      <Route path="/drivers" element={<DashboardPage view="drivers" />} />
      <Route path="/bookings" element={<DashboardPage view="bookings" />} />
      <Route path="/payments" element={<DashboardPage view="payments" />} />
      <Route path="/tickets" element={<DashboardPage view="tickets" />} />
      <Route path="/listings" element={<DashboardPage view="listings" />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AdminWebsite;
