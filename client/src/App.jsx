import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Food image fallbacks by category keyword
const CATEGORY_IMAGES = {
  thali:    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
  rice:     "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80",
  paneer:   "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80",
  chole:    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  paratha:  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
  biryani:  "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80",
  dal:      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
  roti:     "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
  snack:    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
  drink:    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
  default:  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
};

function getFallbackImage(category = "", name = "") {
  const key = (category + " " + name).toLowerCase();
  for (const [k, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(k)) return url;
  }
  return CATEGORY_IMAGES.default;
}

// ── NAVBAR (shared) ───────────────────────────────────────────
function Navbar({ isAdmin, isAdminUser, screen, onNav, onLogout, cartCount }) {
  if (isAdmin) {
    return (
      <header className="navbar admin-navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>Eat It</strong>
        </div>
        <div className="nav-right">
          <button className={`nav-button ${screen === "admin-dashboard" ? "active" : ""}`}
            onClick={() => onNav("admin-dashboard")}>📊 Dashboard</button>
          <button className={`nav-button ${screen === "admin" ? "active" : ""}`}
            onClick={() => onNav("admin")}>📦 Orders</button>
          <button className={`nav-button ${screen === "admin-subscriptions" ? "active" : ""}`}

            onClick={() => onNav("admin-subscriptions")}>⭐ Subscriptions</button>
          <button className={`nav-button ${screen === "admin-menu" ? "active" : ""}`}
            onClick={() => onNav("admin-menu")}>🍱 Menu</button>
          <button className="nav-button" onClick={() => onNav("dashboard")}>🏠 Customer</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="brand">
        <span>🍱</span>
        <strong>Eat It</strong>
      </div>
      <div className="nav-right">
        {isAdminUser && (
  <button
    className="nav-button"
    onClick={() => onNav("admin-dashboard")}
  >
    📊 Admin
  </button>
)}
<button
  className="nav-button"
  onClick={() => onNav("dashboard")}
>
  🏠 Menu
</button>
        <button className={`nav-button ${screen === "orders" ? "active" : ""}`}
          onClick={() => onNav("orders")}>📦 My Orders</button>
          <button className={`nav-button ${screen === "favorites" ? "active" : ""}`}
          onClick={() => onNav("favorites")}>❤️ Favorites</button>
        <button className={`nav-button ${screen === "subscription" ? "active" : ""}`}
          onClick={() => onNav("subscription")}>⭐ Subscription</button>
        <button
  className="cart-indicator"
  onClick={() =>
    document.getElementById("checkout-section")?.scrollIntoView({
      behavior: "smooth",
    })
  }
>
  🛒 {cartCount}
</button>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

// ── MOBILE BOTTOM NAV ─────────────────────────────────────────
function MobileBottomNav({ screen, onNav, isAdminUser }) {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        <button className={`mobile-tab ${screen === "dashboard" ? "tab-active" : ""}`}
          onClick={() => onNav("dashboard")}>
          <span className="tab-icon">🏠</span>Menu
        </button>
        {isAdminUser && (
  <button
    className={`mobile-tab ${screen === "admin-dashboard" ? "tab-active" : ""}`}
    onClick={() => onNav("admin-dashboard")}
  >
    <span className="tab-icon">📊</span>Admin
  </button>
)}
        <button className={`mobile-tab ${screen === "orders" ? "tab-active" : ""}`}
          onClick={() => onNav("orders")}>
          <span className="tab-icon">📦</span>Orders
        </button>
        <button className={`mobile-tab ${screen === "subscription" ? "tab-active" : ""}`}
          onClick={() => onNav("subscription")}>
          <span className="tab-icon">⭐</span>Plans
        </button>
      </div>
    </nav>
  );
}

// ── MENU CARD ─────────────────────────────────────────────────
function MenuCard({
  item,
  onAdd,
  badge,
  isFavorite,
  onToggleFavorite,
  reviews,
  onLoadReviews,
  onSubmitReview,
}) {
  const [imgSrc, setImgSrc] = useState(
    item.image || getFallbackImage(item.category, item.name)
  );
  const [showReviews, setShowReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  const handleReviewsClick = () => {
    const nextState = !showReviews;
    setShowReviews(nextState);

    if (nextState && reviews.length === 0) {
      onLoadReviews(item._id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    await onSubmitReview(item._id, rating, comment.trim());

    setComment("");
    setRating(5);
  };

  return (
    <div
      className={`menu-card ${
        badge === "popular" ? "is-popular" : ""
      } ${badge === "new" ? "is-new" : ""}`}
    >
      <img
        src={imgSrc}
        alt={item.name}
        className="menu-image"
        onError={() =>
          setImgSrc(getFallbackImage(item.category, item.name))
        }
      />

      <div className="menu-content">
        <p className="menu-category">{item.category}</p>

        <h3>{item.name}</h3>

        <p className="menu-description">{item.description}</p>

        <div className="review-summary">
          <button
            type="button"
            className="reviews-toggle"
            onClick={handleReviewsClick}
          >
            ⭐ {averageRating || "No rating"}
            {reviews.length > 0 && ` (${reviews.length})`}
          </button>
        </div>

        {showReviews && (
          <div className="reviews-box">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div className="review-item" key={review._id}>
                    <div className="review-header">
                      <strong>{review.user?.name || "Customer"}</strong>
                      <span>{"⭐".repeat(Number(review.rating))}</span>
                    </div>

                    {review.comment && <p>{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}

            <form className="review-form" onSubmit={handleSubmit}>
              <label>
                Your rating
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5</option>
                  <option value="4">⭐⭐⭐⭐ 4</option>
                  <option value="3">⭐⭐⭐ 3</option>
                  <option value="2">⭐⭐ 2</option>
                  <option value="1">⭐ 1</option>
                </select>
              </label>

              <textarea
                placeholder="Write a review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <div className="review-character-count">
  {comment.length}/500
</div>

              <button type="submit">Submit Review</button>
            </form>
          </div>
        )}

        <div className="menu-bottom">
          <strong>₹{Number(item.price).toFixed(2)}</strong>

          <div className="menu-actions">
            <button
              className={`favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(item)}
              aria-label={
                isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              {isFavorite ? "❤️" : "♡"}
            </button>

            {onAdd && (
              <button onClick={() => onAdd(item)}>+ Add</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD (admin) ─────────────────────────────────────────
function StatCard({ icon, label, category, value }) {
  return (
    <div className="menu-card">
      <div className="menu-placeholder">{icon}</div>
      <div className="menu-content">
        <p className="menu-category">{category}</p>
        <h3>{label}</h3>
        <div className="menu-bottom">
          <strong>{value}</strong>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState("loading");
  const [user,   setUser]   = useState(null);

  const [adminOrders,        setAdminOrders]        = useState([]);
  const [adminSubscriptions, setAdminSubscriptions] = useState([]);
  const [adminMenuItems,     setAdminMenuItems]      = useState([]);
  const [adminStats,         setAdminStats]          = useState({
    totalOrders: 0, cancelledOrders: 0, pendingPayments: 0,
    pendingPaymentAmount: 0, placedOrders: 0, preparingOrders: 0,
    outForDeliveryOrders: 0, deliveredOrders: 0, todayOrders: 0,
    todayRevenue: 0, totalRevenue: 0, activeSubscriptions: 0, totalMenuItems: 0,
  });

  const [orders,  setOrders]  = useState([]);
  const [subscription,        setSubscription]        = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");

  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [menuItems,       setMenuItems]       = useState([]);
  const [cart,            setCart]            = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const getDeliveryDate = () => {
  const now = new Date();

  const indiaTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  const deliveryDate = new Date(indiaTime);

  if (indiaTime.getHours() >= 11) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  return deliveryDate;
};
  const [activeCategory,  setActiveCategory]  = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [menuForm, setMenuForm] = useState({
    name: "", description: "", price: "", category: "", image: "", available: true,
  });
  const [editingMenuId, setEditingMenuId] = useState(null);

  // ── session restore ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setScreen("login"); return; }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then((d) => {
        setUser(d.user);
        setScreen(d.user?.role === "admin" ? "admin-dashboard" : "dashboard");
      })
      .catch(() => { localStorage.removeItem("token"); setScreen("login"); });
  }, []);

  // ── load menu on dashboard ──
  useEffect(() => {
    if (screen !== "dashboard") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/menu`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then((d) => setMenuItems(d.menuItems || []))
      .catch((err) => { console.error(err); setError("Could not load menu."); });
  }, [screen]);

  // ── load favorites on dashboard ──
useEffect(() => {
  if (screen !== "dashboard") return;
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API_URL}/api/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      return d;
    })
    .then((d) => setFavorites(d || []))
    .catch((err) => console.error("Could not load favorites:", err));
}, [screen]);
// ── load reviews on dashboard ──
useEffect(() => {
  if (screen !== "dashboard") return;

  menuItems.forEach((item) => {
    loadReviews(item._id);
  });
}, [screen, menuItems]);

  // ── screen-driven loads ──
  useEffect(() => {
    if (screen === "admin-dashboard" && user?.role === "admin") loadAdminStats();
    if (screen === "admin"           && user?.role === "admin") loadAdminOrders();
    if (screen === "admin-subscriptions" && user?.role === "admin") loadAdminSubscriptions();
    if (screen === "subscription") loadSubscriptionHistory();
  }, [screen, user]);

  // ── nav helper ──
  const goTo = (target) => {
    setError(""); setSuccess("");
    if (target === "admin")              { loadAdminOrders();        }
    if (target === "admin-dashboard")    { loadAdminStats();         }
    if (target === "admin-subscriptions"){ loadAdminSubscriptions(); }
    if (target === "admin-menu")         { loadAdminMenu();          }
    if (target === "orders")             { loadOrders();             }
    if (target === "subscription")       { loadSubscription(); loadSubscriptionHistory(); }
    if (target === "favorites") { setScreen("favorites"); }
    setScreen(target);
  };

  // ── auth ──
  const login = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const r = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Login failed");
      localStorage.setItem("token", d.token);
      setUser(d.user); setPassword("");
      setScreen(d.user?.role === "admin" ? "admin-dashboard" : "dashboard");
    } catch (err) { setError(err.message); }
  };

  const register = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const r = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Registration failed");
      localStorage.setItem("token", d.token);
      setUser(d.user); setPassword(""); setScreen("dashboard");
    } catch (err) { setError(err.message); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null); setCart([]); setScreen("login");
  };

  // ── cart ──
  const addToCart = (item) =>
    setCart((c) => {
      const ex = c.find((i) => i._id === item._id);
      return ex
        ? c.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...c, { ...item, quantity: 1 }];
    });

  const decreaseQuantity = (id) =>
    setCart((c) => c.map((i) => i._id === id ? { ...i, quantity: i.quantity - 1 } : i).filter((i) => i.quantity > 0));

  const increaseQuantity = (id) =>
    setCart((c) => c.map((i) => i._id === id ? { ...i, quantity: i.quantity + 1 } : i));

  const toggleFavorite = async (item) => {
  const token = localStorage.getItem("token");
  if (!token) {
    setError("Please login to manage favorites.");
    return;
  }

  const isFavorite = favorites.some((fav) => fav._id === item._id);

  try {
    const r = await fetch(
      `${API_URL}/api/favorites/${item._id}`,
      {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const d = await r.json();

    if (!r.ok) {
      throw new Error(d.message || "Failed to update favorite");
    }

    if (isFavorite) {
      setFavorites((prev) =>
        prev.filter((fav) => fav._id !== item._id)
      );
    } else {
      setFavorites((prev) => [...prev, item]);
    }
  } catch (err) {
    setError(err.message);
  }
};
const loadReviews = async (menuItemId) => {
  try {
    const r = await fetch(`${API_URL}/api/reviews/${menuItemId}`);
    const d = await r.json();

    if (!r.ok) {
      throw new Error(d.message || "Failed to load reviews");
    }

    setReviews((prev) => ({
      ...prev,
      [menuItemId]: d || [],
    }));
  } catch (err) {
    console.error("Could not load reviews:", err);
  }
};
const submitReview = async (menuItemId, rating, comment) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Please login to leave a review.");
    return;
  }

  try {
    const r = await fetch(`${API_URL}/api/reviews/${menuItemId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    const d = await r.json();

    if (!r.ok) {
      throw new Error(d.message || "Failed to submit review");
    }

    setReviews((prev) => ({
      ...prev,
      [menuItemId]: [d, ...(prev[menuItemId] || [])],
    }));

    setSuccess("Review submitted successfully.");
  } catch (err) {
    setError(err.message);
  }
};

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  // ── data loaders ──
  const apiGet = async (path) => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Session expired. Please login again."); return null; }
    const r = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || "Request failed");
    return d;
  };

  const loadOrders = async () => {
    try { setError(""); const d = await apiGet("/api/orders"); if (d) setOrders(d.orders || []); }
    catch (err) { setError(err.message); }
  };

  const loadAdminOrders = async () => {
    try { setError(""); const d = await apiGet("/api/orders/admin/all"); if (d) setAdminOrders(d.orders || []); }
    catch (err) { setError(err.message); }
  };

  const loadAdminStats = async () => {
    try {
      setError("");
      const d = await apiGet("/api/admin/stats");
      if (d) setAdminStats(d.stats || adminStats);
    } catch (err) { setError(err.message); }
  };

  const loadAdminSubscriptions = async () => {
    try { setError(""); const d = await apiGet("/api/subscriptions/admin/all"); if (d) setAdminSubscriptions(d.subscriptions || []); }
    catch (err) { setError(err.message); }
  };

  const loadAdminMenu = async () => {
    try { setError(""); const d = await apiGet("/api/menu/admin/all"); if (d) setAdminMenuItems(d.menuItems || []); }
    catch (err) { setError(err.message); }
  };

  const loadSubscription = async () => {
    try { setError(""); const d = await apiGet("/api/subscriptions"); if (d) setSubscription(d.subscription || null); }
    catch (err) { setError(err.message); }
  };

  const loadSubscriptionHistory = async () => {
    try { setError(""); const d = await apiGet("/api/subscriptions/history"); if (d) setSubscriptionHistory(d.subscriptions || []); }
    catch (err) { setError(err.message); }
  };

  // ── admin menu ops ──
  const addMenuItem = async () => {
    const token = localStorage.getItem("token");
    try {
      setError(""); setSuccess("");
      const r = await fetch(`${API_URL}/api/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(menuForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSuccess("Menu item added.");
      setMenuForm({ name:"", description:"", price:"", category:"", image:"", available:true });
      await loadAdminMenu();
    } catch (err) { setError(err.message); }
  };

  const updateMenuItem = async () => {
    const token = localStorage.getItem("token");
    try {
      setError(""); setSuccess("");
      const r = await fetch(`${API_URL}/api/menu/${editingMenuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(menuForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSuccess("Menu item updated.");
      setEditingMenuId(null);
      setMenuForm({ name:"", description:"", price:"", category:"", image:"", available:true });
      await loadAdminMenu();
    } catch (err) { setError(err.message); }
  };

  const toggleMenuAvailability = async (item) => {
    const token = localStorage.getItem("token");
    try {
      setError(""); setSuccess("");
      const r = await fetch(`${API_URL}/api/menu/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ available: !item.available }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSuccess(`${item.name} is now ${d.menuItem.available ? "available" : "unavailable"}.`);
      await loadAdminMenu();
    } catch (err) { setError(err.message); }
  };

  const deleteMenuItem = async (itemId) => {
    const token = localStorage.getItem("token");
    try {
      setError(""); setSuccess("");
      const r = await fetch(`${API_URL}/api/menu/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSuccess("Menu item deleted.");
      await loadAdminMenu();
    } catch (err) { setError(err.message); }
  };

  const startEditingMenuItem = (item) => {
    setEditingMenuId(item._id);
    setMenuForm({
      name: item.name || "", description: item.description || "",
      price: item.price ?? "", category: item.category || "",
      image: item.image || "", available: item.available !== undefined ? item.available : true,
    });
    setError(""); setSuccess("");
    setTimeout(() => document.getElementById("admin-menu-edit-form")?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
  };

  const cancelEditingMenuItem = () => {
    setEditingMenuId(null);
    setMenuForm({ name:"", description:"", price:"", category:"", image:"", available:true });
    setError(""); setSuccess("");
  };

  // ── payment ──
  const startPayment = async () => {
    const token = localStorage.getItem("token");
    if (!token)                    { setError("Session expired. Please login again."); return; }
    if (!cart.length)              { setError("Your cart is empty."); return; }
    if (!deliveryAddress.trim())   { setError("Please enter your delivery address."); return; }

    const orderItems = cart.map((i) => ({ menuItem: i._id, quantity: i.quantity }));

    try {
      setError(""); setSuccess("");

      // check availability
      const avCheck = await fetch(`${API_URL}/api/payments/check-availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: orderItems }),
      });
      const avData = await avCheck.json();
      if (!avCheck.ok) throw new Error(avData.message || "One or more items are unavailable");

      const unavailable = cart.filter((i) => i.available === false);
      if (unavailable.length) {
        setError(`${unavailable.map((i) => i.name).join(", ")} is no longer available.`);
        return;
      }
      if (paymentMethod === "COD") {
  const codResponse = await fetch(`${API_URL}/api/payments/create-cod-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: orderItems,
      deliveryAddress: deliveryAddress.trim(),
      phone: user?.phone || "",
    }),
  });

  const codData = await codResponse.json();

  if (!codResponse.ok) {
    throw new Error(codData.message || "Could not place COD order");
  }

  setSuccess(`Order placed! Order ID: ${codData.order._id}`);
  setCart([]);
  setDeliveryAddress("");
  return;
}
      // create order
      const r = await fetch(`${API_URL}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: orderItems }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Could not create payment order");

      const options = {
        key: d.keyId,
        amount: d.order.amount,
        currency: d.order.currency,
        name: "Eat It",
        description: "Eat It Food Order",
        order_id: d.order.id,
        handler: async (paymentResponse) => {
          try {
            setSuccess("Payment successful. Verifying…");
            const vr = await fetch(`${API_URL}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id:   paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature:  paymentResponse.razorpay_signature,
                items: orderItems,
                deliveryAddress: deliveryAddress.trim(),
                phone: user?.phone || "",
              }),
            });
            const vd = await vr.json();
            if (!vr.ok) throw new Error(vd.message || "Payment verification failed");
            setSuccess(`Order placed! Order ID: ${vd.order._id}`);
            setCart([]); setDeliveryAddress("");
          } catch (err) { setError(err.message); }
        },
        modal: { ondismiss: () => { setError("Payment cancelled."); setSuccess(""); } },
        prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
        theme: { color: "#f59e0b" },
      };

      new window.Razorpay(options).open();
    } catch (err) { setError(err.message); }
  };

  // ── subscription payment helper ──
  const startSubscriptionPayment = async (plan, price) => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Session expired."); return; }
    try {
      setError(""); setSuccess("");
      const r = await fetch(`${API_URL}/api/payments/create-subscription-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, price }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);

      const options = {
        key: d.keyId, amount: d.order.amount, currency: d.order.currency,
        name: "Eat It", description: `Eat It ${plan} Subscription`, order_id: d.order.id,
        handler: async (pr) => {
          try {
            setSuccess("Verifying subscription…");
            const vr = await fetch(`${API_URL}/api/payments/verify-subscription`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: pr.razorpay_order_id,
                razorpay_payment_id: pr.razorpay_payment_id,
                razorpay_signature: pr.razorpay_signature,
                plan, mealsPerDay: 1, deliveryAddress: "",
              }),
            });
            const vd = await vr.json();
            if (!vr.ok) throw new Error(vd.message);
            setSubscription(vd.subscription);
            await loadSubscriptionHistory();
            setSuccess(`${plan} subscription activated!`);
          } catch (err) { setError(err.message); }
        },
        modal: { ondismiss: () => { setError("Payment cancelled."); setSuccess(""); } },
        prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
        theme: { color: "#f59e0b" },
      };
      new window.Razorpay(options).open();
    } catch (err) { setError(err.message); }
  };

  // ── cancel order (user) ──
  const cancelOrder = async (orderId, reload) => {
    const token = localStorage.getItem("token");
    try {
      setError(""); setSuccess("");
      const r = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSuccess("Order cancelled.");
      await reload();
    } catch (err) { setError(err.message); }
  };

  // ── cancel subscription (admin) ──
  const cancelAdminSubscription = async (subId) => {
    const token = localStorage.getItem("token");
    try {
      setError(""); setSuccess("");
      const r = await fetch(`${API_URL}/api/subscriptions/${subId}/cancel`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSuccess("Subscription cancelled.");
      await loadAdminSubscriptions();
    } catch (err) { setError(err.message); }
  };

  // ── derived: category list ──
  const categories = ["All", ...Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean)))];

const filteredMenu = menuItems.filter((item) => {
  const matchesCategory =
    activeCategory === "All" || item.category === activeCategory;

  const matchesSearch =
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesPrice =
    maxPrice === "" || Number(item.price) <= Number(maxPrice);

  return matchesCategory && matchesSearch && matchesPrice;
});
  // ═════════════════════════════════════════════════════════════
  // SCREENS
  // ═════════════════════════════════════════════════════════════

  // ── loading ──
  if (screen === "loading") {
    return (
      <div className="app">
        <div className="loading-card">
          <h1>🍱 Eat It</h1>
          <p>Checking your session…</p>
        </div>
      </div>
    );
  }

  // ── login ──
  if (screen === "login") {
    return (
      <div className="app auth-page">
        <div className="auth-card">
          <h1>Eat It</h1>
          <p className="auth-subtitle">Login to continue</p>
          {error && <div className="error">{error}</div>}
          <form onSubmit={login}>
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
          </form>
          <p className="switch-text">Don't have an account?</p>
          <button className="secondary-button" onClick={() => { setError(""); setScreen("register"); }}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // ── register ──
  if (screen === "register") {
    return (
      <div className="app auth-page">
        <div className="auth-card">
          <h1>Eat It</h1>
          <p className="auth-subtitle">Create your account</p>
          {error && <div className="error">{error}</div>}
          <form onSubmit={register}>
            <input type="text"     placeholder="Full name"   value={name}     onChange={(e) => setName(e.target.value)}     required />
            <input type="email"    placeholder="Email"       value={email}    onChange={(e) => setEmail(e.target.value)}    required />
            <input type="tel"      placeholder="Phone number" value={phone}   onChange={(e) => setPhone(e.target.value)}    required />
            <input type="password" placeholder="Password (min 6 chars)" value={password}
              onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            <button type="submit">Create Account</button>
          </form>
          <p className="switch-text">Already have an account?</p>
          <button className="secondary-button" onClick={() => { setError(""); setScreen("login"); }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── admin dashboard ──
  if (screen === "admin-dashboard") {
    return (
      <div className="app">
        <Navbar isAdmin screen={screen} onNav={goTo} onLogout={logout} />
        <main className="dashboard">

          <section className="welcome">
            <p className="small-text">Administrator</p>
            <h1>Dashboard Overview</h1>
            <p>Here's a live snapshot of your Eat It business.</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>₹{Number(adminStats.totalRevenue).toFixed(0)}</strong>
                <span>Total Revenue</span>
              </div>
              <div className="hero-stat">
                <strong>{adminStats.totalOrders}</strong>
                <span>All Orders</span>
              </div>
              <div className="hero-stat">
                <strong>{adminStats.activeSubscriptions}</strong>
                <span>Active Plans</span>
              </div>
              <div className="hero-stat">
                <strong>{adminStats.totalMenuItems}</strong>
                <span>Menu Items</span>
              </div>
            </div>
          </section>

          {error   && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <h2 className="admin-stats-title">📊 Orders Overview</h2>
          <div className="admin-stats-grid">
            <StatCard icon="📦" category="ORDERS"       label="Total Orders"          value={adminStats.totalOrders} />
            <StatCard icon="📅" category="TODAY"        label="Today's Orders"         value={adminStats.todayOrders} />
            <StatCard icon="💰" category="TODAY"        label="Today's Revenue"        value={`₹${Number(adminStats.todayRevenue).toFixed(2)}`} />
            <StatCard icon="💰" category="REVENUE"      label="Total Revenue"          value={`₹${Number(adminStats.totalRevenue).toFixed(2)}`} />
            <StatCard icon="⭐" category="SUBSCRIPTIONS" label="Active Subscriptions"  value={adminStats.activeSubscriptions} />
            <StatCard icon="🍱" category="MENU"         label="Total Menu Items"       value={adminStats.totalMenuItems} />
            <StatCard icon="❌" category="CANCELLED"    label="Cancelled Orders"       value={adminStats.cancelledOrders} />
            <StatCard icon="💳" category="PAYMENTS"     label="Pending Payments"       value={adminStats.pendingPayments} />
            <StatCard icon="💰" category="PAYMENTS"     label="Pending Amount"         value={`₹${Number(adminStats.pendingPaymentAmount).toFixed(2)}`} />
            <StatCard icon="🟠" category="ORDERS"       label="Placed Orders"          value={adminStats.placedOrders} />
            <StatCard icon="🔵" category="ORDERS"       label="Preparing Orders"       value={adminStats.preparingOrders} />
            <StatCard icon="🚚" category="DELIVERY"     label="Out for Delivery"       value={adminStats.outForDeliveryOrders} />
            <StatCard icon="🟢" category="ORDERS"       label="Delivered Orders"       value={adminStats.deliveredOrders} />
          </div>

          <section className="orders-section">
            <div className="section-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Jump to any section of your Eat It system.</p>
              </div>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"12px" }}>
              <button className="checkout-button" style={{ width:"auto", minWidth:200, marginTop:0 }}
                onClick={() => goTo("admin")}>📦 Manage Orders</button>
              <button className="checkout-button" style={{ width:"auto", minWidth:200, marginTop:0 }}
                onClick={() => goTo("admin-subscriptions")}>⭐ Manage Subscriptions</button>
              <button className="checkout-button" style={{ width:"auto", minWidth:200, marginTop:0 }}
                onClick={() => goTo("admin-menu")}>🍱 Manage Menu</button>
            </div>
          </section>

        </main>
      </div>
    );
  }

  // ── admin orders ──
  if (screen === "admin") {
    const updateOrderStatus = async (orderId, status) => {
      const token = localStorage.getItem("token");
      try {
        setError(""); setSuccess("");
        const r = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message);
        setAdminOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: d.order.status } : o));
        setSuccess(`Order status → "${status}"`);
      } catch (err) { setError(err.message); }
    };

    return (
      <div className="app">
        <Navbar isAdmin screen={screen} onNav={goTo} onLogout={logout} />
        <main className="dashboard">
          <section className="welcome">
            <p className="small-text">Administrator</p>
            <h1>Order Management</h1>
            <p>View and update all customer orders in real time.</p>
          </section>

          {error   && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {adminOrders.length === 0 ? (
            <div className="empty-card"><div style={{ fontSize:50 }}>📦</div><h2>No orders yet</h2><p>Customer orders will appear here.</p></div>
          ) : (
            <div className="orders-list">
              {adminOrders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div className="order-header">
                    <div>
                      <p className="small-text">Order</p>
                      <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                      <p>Customer: {order.user?.name || "Unknown"}</p>
                      <p>Email: {order.user?.email || "N/A"}</p>
                      <p>Phone: {order.phone || order.user?.phone || "N/A"}</p>
                    </div>
                    <span className={`order-status ${String(order.status).toLowerCase().replaceAll(" ", "-")}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div className="order-item" key={`${order._id}-${idx}`}>
                        <div>
                          <strong>{item.name}</strong>
                          <p>₹{Number(item.price).toFixed(2)} × {item.quantity}</p>
                        </div>
                        <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                      {order.deliveryAddress && <p className="order-address">📍 {order.deliveryAddress}</p>}
                      <p className="order-payment">💳 Payment: <strong>{order.paymentStatus || "Pending"}</strong></p>
                      {order.status === "Placed" && (
                        <button className="cancel-order-button"
                          onClick={() => cancelOrder(order._id, loadAdminOrders)}>
                          Cancel Order
                        </button>
                      )}
                    </div>
                    <strong>Total: ₹{Number(order.totalAmount).toFixed(2)}</strong>
                  </div>

                  <div className="admin-status-controls">
                    <p>Update order status:</p>
                    <div className="status-buttons">
                      {["Placed","Preparing","Out for Delivery","Delivered","Cancelled"].map((s) => (
                        <button key={s} onClick={() => updateOrderStatus(order._id, s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── admin subscriptions ──
  if (screen === "admin-subscriptions") {
    return (
      <div className="app">
        <Navbar isAdmin screen={screen} onNav={goTo} onLogout={logout} />
        <main className="dashboard">
          <section className="welcome">
            <p className="small-text">Administrator</p>
            <h1>Subscription Management</h1>
            <p>View all active and cancelled Eat It subscriptions.</p>
          </section>

          {error   && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {adminSubscriptions.length === 0 ? (
            <div className="empty-card"><div style={{ fontSize:50 }}>⭐</div><h2>No subscriptions yet</h2><p>Customer subscriptions will appear here.</p></div>
          ) : (
            <div className="subscription-admin-list orders-list">
              {adminSubscriptions.map((sub) => (
                <div className="order-card" key={sub._id}>
                  <div className="order-header">
                    <div>
                      <p className="small-text">Subscription</p>
                      <strong>#{sub._id.slice(-8).toUpperCase()}</strong>
                      <p>Customer: {sub.user?.name || "Unknown"}</p>
                      <p>Email: {sub.user?.email || "N/A"}</p>
                      <p>Phone: {sub.user?.phone || "N/A"}</p>
                    </div>
                    <span className={`order-status ${String(sub.status).toLowerCase().replaceAll(" ", "-")}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="order-items">
                    <div className="order-item">
                      <div>
                        <strong>{sub.plan} Plan</strong>
                        <p>{sub.mealsPerDay} meal{sub.mealsPerDay !== 1 ? "s" : ""} per day</p>
                      </div>
                      <strong>₹{Number(sub.price).toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="order-footer">
                    <div>
                      <p>Start: {new Date(sub.startDate).toLocaleDateString()}</p>
                      <p>End: {new Date(sub.endDate).toLocaleDateString()}</p>
                      {sub.deliveryAddress && <p className="order-address">📍 {sub.deliveryAddress}</p>}
                      <p className="order-payment">💳 Payment: <strong>{sub.paymentStatus || "Pending"}</strong></p>
                    </div>
                    <strong>{sub.status}</strong>
                  </div>
                  {sub.status === "Active" && (
                    <div style={{ marginTop:14 }}>
                      <button className="cancel-order-button" onClick={() => cancelAdminSubscription(sub._id)}>
                        Cancel Subscription
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── admin menu ──
  if (screen === "admin-menu") {
    return (
      <div className="app">
        <Navbar isAdmin screen={screen} onNav={goTo} onLogout={logout} />
        <main className="dashboard">
          <section className="welcome">
            <p className="small-text">Administrator</p>
            <h1>Menu Management</h1>
            <p>Add, edit, enable, disable and delete menu items.</p>
          </section>

          {error   && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {/* ADD / EDIT FORM */}
          <section id="admin-menu-edit-form" className="cart-section">
            <div className="section-heading">
              <div>
                <h2>{editingMenuId ? "Edit Menu Item" : "Add New Menu Item"}</h2>
                <p>{editingMenuId ? "Update the selected item." : "Create a new item for the menu."}</p>
              </div>
            </div>
            <div className="delivery-section">
              <input type="text"    placeholder="Item name"   value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} />
              <textarea placeholder="Description" value={menuForm.description} rows={3}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} />
              <input type="number"  placeholder="Price" min="0" step="0.01" value={menuForm.price}
                onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} />
              <input type="text"    placeholder="Category" value={menuForm.category}
                onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} />
              <input type="url"     placeholder="Image URL" value={menuForm.image}
                onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })} />
              {menuForm.image && (
                <img src={menuForm.image} alt="Preview" className="menu-image-preview"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  onLoad={(e)  => { e.currentTarget.style.display = "block"; }} />
              )}
              <label>
                <input type="checkbox" checked={menuForm.available}
                  onChange={(e) => setMenuForm({ ...menuForm, available: e.target.checked })} />
                Available
              </label>
              <div style={{ display:"flex", gap:10, marginTop:8, flexWrap:"wrap" }}>
                <button className="checkout-button" type="button"
                  onClick={editingMenuId ? updateMenuItem : addMenuItem}>
                  {editingMenuId ? "Update Menu Item" : "Add Menu Item"}
                </button>
                {editingMenuId && (
                  <button className="secondary-button" type="button" onClick={cancelEditingMenuItem}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* LIST */}
          <section className="orders-section">
            <div className="section-heading">
              <div>
                <h2>All Menu Items</h2>
                <p>Showing all available and unavailable items.</p>
              </div>
              <strong>{adminMenuItems.length} item{adminMenuItems.length !== 1 ? "s" : ""}</strong>
            </div>

            {adminMenuItems.length === 0 ? (
              <div className="empty-card"><div style={{ fontSize:50 }}>🍱</div><h2>No menu items</h2><p>Add your first item above.</p></div>
            ) : (
              <div className="menu-grid admin-menu-grid">
                {adminMenuItems.map((item) => {
                  const [imgSrc, setImgSrc] = [
                    item.image || getFallbackImage(item.category, item.name),
                    () => {},
                  ];
                  return (
                    <div className="menu-card" key={item._id}>
                      <img src={item.image || getFallbackImage(item.category, item.name)}
                        alt={item.name} className="menu-image"
                        onError={(e) => { e.currentTarget.src = getFallbackImage(item.category, item.name); }} />
                      <div className="menu-content">
                        <p className="menu-category">{item.category}</p>
                        <h3>{item.name}</h3>
                        <p className="menu-description">{item.description}</p>
                        <div className="menu-bottom">
                          <strong>₹{Number(item.price).toFixed(2)}</strong>
                          <span className={`order-status ${item.available ? "delivered" : "cancelled"}`}>
                            {item.available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:15 }}>
                          <button type="button" onClick={() => startEditingMenuItem(item)}>✏️ Edit</button>
                          <button type="button" onClick={() => toggleMenuAvailability(item)}>
                            {item.available ? "🔴 Disable" : "🟢 Enable"}
                          </button>
                          <button type="button" onClick={() => {
                            if (window.confirm(`Delete "${item.name}"?`)) deleteMenuItem(item._id);
                          }}>🗑️ Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // ── my orders ──
  if (screen === "orders") {
    return (
      <div className="app">
        <Navbar
  screen={screen}
  onNav={goTo}
  onLogout={logout}
  isAdminUser={user?.role === "admin"}
/>
        <main className="dashboard">
          <section className="welcome">
            <p className="small-text">Order History</p>
            <h1>My Orders</h1>
            <p>Track your current and past Eat It deliveries.</p>
          </section>

          {error   && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {orders.length === 0 ? (
            <div className="empty-card">
              <div style={{ fontSize:50 }}>📦</div>
              <h2>No orders yet</h2>
              <p>Your completed orders will appear here.</p>
              <button className="checkout-button" style={{ maxWidth:220, margin:"20px auto 0" }}
                onClick={() => goTo("dashboard")}>Browse Menu</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div className="order-header">
                    <div>
                      <p className="small-text">Order</p>
                      <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                    </div>
                    <div className="order-tracking">
                      {order.status === "Cancelled" ? (
                        <div className="tracking-cancelled">
                          <span>❌</span>
                          <strong>Cancelled</strong>
                        </div>
                      ) : (
                        <>
                          {[
                            { label:"Placed",          active:["Placed","Preparing","Out for Delivery","Delivered"].includes(order.status) },
                            { label:"Preparing",        active:["Preparing","Out for Delivery","Delivered"].includes(order.status) },
                            { label:"Out for Delivery", active:["Out for Delivery","Delivered"].includes(order.status) },
                            { label:"Delivered",        active:order.status === "Delivered" },
                          ].map((s, i) => (
                            <div key={s.label} className={`tracking-step ${s.active ? "active" : ""}`}>
                              <span>{i + 1}</span>
                              <strong>{s.label}</strong>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div className="order-item" key={`${order._id}-${idx}`}>
                        <div>
                          <strong>{item.name}</strong>
                          <p>₹{Number(item.price).toFixed(2)} × {item.quantity}</p>
                        </div>
                        <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                      {order.deliveryAddress && <p className="order-address">📍 {order.deliveryAddress}</p>}
                      <p className="order-payment">💳 Payment: <strong>{order.paymentStatus || "Pending"}</strong></p>
                      {order.status === "Placed" && (
                        <button className="cancel-order-button"
                          onClick={() => cancelOrder(order._id, loadOrders)}>
                          Cancel Order
                        </button>
                      )}
                    </div>
                    <strong>Total: ₹{Number(order.totalAmount).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <MobileBottomNav
  screen={screen}
  onNav={goTo}
  isAdminUser={user?.role === "admin"}
/>
      </div>
    );
  }

  // ── subscription ──
  if (screen === "subscription") {
    return (
      <div className="app">
        <Navbar
  screen={screen}
  onNav={goTo}
  onLogout={logout}
  cartCount={cartCount}
  isAdminUser={user?.role === "admin"}
/>
        <main className="dashboard">
          <section className="welcome">
            <p className="small-text">Eat It Plans</p>
            <h1>Subscription</h1>
            <p>Get daily meals delivered without ordering every day.</p>
          </section>

          {error   && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {subscription ? (
            <div className="subscription-active">
              <div className="subscription-icon">⭐</div>
              <p className="small-text">Active Subscription</p>
              <h2>{subscription.plan} Plan</h2>
              <div className="subscription-details">
                <div><span>Meals / day</span><strong>{subscription.mealsPerDay}</strong></div>
                <div><span>Price</span><strong>₹{subscription.price}</strong></div>
                <div><span>Start</span><strong>{new Date(subscription.startDate).toLocaleDateString()}</strong></div>
                <div><span>End</span><strong>{new Date(subscription.endDate).toLocaleDateString()}</strong></div>
              </div>
              <button className="cancel-subscription" onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  setError(""); setSuccess("");
                  const r = await fetch(`${API_URL}/api/subscriptions/cancel`, {
                    method:"PATCH", headers:{ Authorization:`Bearer ${token}` },
                  });
                  const d = await r.json();
                  if (!r.ok) throw new Error(d.message);
                  setSubscription(null);
                  await loadSubscriptionHistory();
                  setSuccess("Subscription cancelled.");
                } catch (err) { setError(err.message); }
              }}>Cancel Subscription</button>
            </div>
          ) : (
            <div className="subscription-plans">
              {/* WEEKLY */}
              <div className="plan-card">
                <div className="plan-icon">🍱</div>
                <h2>Weekly</h2>
                <p className="plan-description">Perfect for trying Eat It for one week.</p>
                <div className="plan-price">₹700<span>/week</span></div>
                <ul>
                  <li>✓ Daily tiffin delivery</li>
                  <li>✓ 1 meal per day</li>
                  <li>✓ Flexible cancellation</li>
                </ul>
                <button className="checkout-button" onClick={() => startSubscriptionPayment("Weekly", 700)}>
                  Choose Weekly
                </button>
              </div>

              {/* MONTHLY */}
              <div className="plan-card featured-plan">
                <div className="popular-label">MOST POPULAR</div>
                <div className="plan-icon">👑</div>
                <h2>Monthly</h2>
                <p className="plan-description">Best value for regular students — save ₹300.</p>
                <div className="plan-price">₹2,500<span>/month</span></div>
                <ul>
                  <li>✓ Daily tiffin delivery</li>
                  <li>✓ 1 meal per day</li>
                  <li>✓ Better monthly value</li>
                  <li>✓ Flexible cancellation</li>
                </ul>
                <button className="checkout-button" onClick={() => startSubscriptionPayment("Monthly", 2500)}>
                  Choose Monthly
                </button>
              </div>
            </div>
          )}

          {/* HISTORY */}
          <section className="orders-section">
            <div className="section-heading">
              <div><h2>Subscription History</h2><p>Your previous and current subscriptions.</p></div>
            </div>
            {subscriptionHistory.length === 0 ? (
              <div className="empty-card"><div style={{ fontSize:50 }}>⭐</div><h2>No history yet</h2><p>Your subscriptions will appear here.</p></div>
            ) : (
              <div className="orders-list">
                {subscriptionHistory.map((s) => (
                  <div className="order-card" key={s._id}>
                    <div className="order-header">
                      <div>
                        <p className="small-text">Subscription</p>
                        <strong>{s.plan} Plan</strong>
                        <p>{s.mealsPerDay} meal{s.mealsPerDay !== 1 ? "s" : ""} per day</p>
                      </div>
                      <span className={`order-status ${String(s.status).toLowerCase().replaceAll(" ","-")}`}>{s.status}</span>
                    </div>
                    <div className="order-items">
                      <div className="order-item">
                        <div><strong>Price</strong></div>
                        <strong>₹{Number(s.price).toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="order-footer">
                      <div>
                        <p>Start: {new Date(s.startDate).toLocaleDateString()}</p>
                        <p>End: {new Date(s.endDate).toLocaleDateString()}</p>
                        {s.deliveryAddress && <p className="order-address">📍 {s.deliveryAddress}</p>}
                        <p className="order-payment">💳 Payment: <strong>{s.paymentStatus || "Pending"}</strong></p>
                      </div>
                      <strong>{s.status}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        <MobileBottomNav
  screen={screen}
  onNav={goTo}
  isAdminUser={user?.role === "admin"}
/>
      </div>
    );
  }
  // ── favorites ──
if (screen === "favorites") {
  return (
    <div className="app">
      <Navbar
        screen={screen}
        onNav={goTo}
        onLogout={logout}
        cartCount={cartCount}
        isAdminUser={user?.role === "admin"}
      />

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">Eat It</p>
          <h1>❤️ My Favorites</h1>
          <p>Meals you've saved for later.</p>
        </section>

        {favorites.length === 0 ? (
          <div className="empty-card">
            <div style={{ fontSize: 50 }}>♡</div>
            <h2>No favorites yet</h2>
            <p>Add meals to your favorites and they will appear here.</p>
          </div>
        ) : (
          <section className="menu-section">
            <div className="menu-grid">
              {favorites.map((item, idx) => (
                <MenuCard
  key={item._id}
  item={item}
  onAdd={addToCart}
 badge={idx === 0 ? "popular" : idx === favorites.length - 1 ? "new" : null}
  isFavorite={favorites.some((fav) => fav._id === item._id)}
  onToggleFavorite={toggleFavorite}
  reviews={reviews[item._id] || []}
  onLoadReviews={loadReviews}
  onSubmitReview={submitReview}
/>
              ))}
            </div>
          </section>
        )}
      </main>

      <MobileBottomNav
        screen={screen}
        onNav={goTo}
        isAdminUser={user?.role === "admin"}
      />
    </div>
  );
}

  // ── customer dashboard (default) ──────────────────────────────
  return (
    <div className="app">
      <Navbar
  screen={screen}
  onNav={goTo}
  onLogout={logout}
  cartCount={cartCount}
  isAdminUser={user?.role === "admin"}
/>
      <main className="dashboard">

        {/* HERO */}
        <section className="welcome">
          <div className="hero-badge">🔥 FRESHLY PREPARED DAILY</div>
          <p className="small-text">Student Dashboard</p>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</h1>
          <p>Fresh homestyle meals delivered to your hostel or office — no cooking, no stress.</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>30 min</strong>
              <span>Avg delivery</span>
            </div>
            <div className="hero-stat">
              <strong>4.8 ★</strong>
              <span>Avg rating</span>
            </div>
            <div className="hero-stat">
              <strong>{menuItems.length}+</strong>
              <span>Items today</span>
            </div>
          </div>
        </section>

        {error   && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* MENU */}
        <section className="menu-section">
          <div className="section-heading">
            <div>
              <h2>Today's Menu</h2>
              <p>Fresh meals prepared for you every day.</p>
            </div>
            <div className="cart-total">Cart: ₹{cartTotal.toFixed(2)}</div>
          </div>
          {/* SEARCH */}
<div className="menu-search">
  <input
    type="text"
    placeholder="🔎 Search meals..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
<label className="price-filter-label">Max Price</label>
<div className="price-filter">
  <input
    type="number"
    min="0"
    placeholder="Max price ₹"
    value={maxPrice}
    onChange={(e) => setMaxPrice(e.target.value)}
  />
</div>
          <button
  type="button"
  className="clear-filters-btn"
  onClick={() => {
    setSearchTerm("");
    setMaxPrice("");
    setActiveCategory("All");
  }}
>
  Clear Filters
</button>
          {/* CATEGORY FILTER */}
          {categories.length > 1 && (
            <div className="filter-bar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-tag ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredMenu.length === 0 ? (
            <div className="empty-card"><p>No menu items available right now.</p></div>
          ) : (
            <div className="menu-grid">
              {filteredMenu.map((item, idx) => (
                <MenuCard
  key={item._id}
  item={item}
  onAdd={addToCart}
  badge={idx === 0 ? "popular" : idx === filteredMenu.length - 1 ? "new" : null}
  isFavorite={favorites.some((fav) => fav._id === item._id)}
  onToggleFavorite={toggleFavorite}
  reviews={reviews[item._id] || []}
  onLoadReviews={loadReviews}
  onSubmitReview={submitReview}
/>
              ))}
            </div>
          )}
        </section>

        {/* CART */}
        {cart.length > 0 && (
          <section id="checkout-section" className="cart-section">
            <div className="section-heading">
              <div>
                <h2>Your Cart</h2>
                <p>{cartCount} item{cartCount !== 1 ? "s" : ""} selected</p>
              </div>
              <strong style={{ color:"var(--saffron-dark)", fontSize:18 }}>
                ₹{cartTotal.toFixed(2)}
              </strong>
            </div>

            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  {/* thumbnail */}
                  <img
                    src={item.image || getFallbackImage(item.category, item.name)}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => { e.currentTarget.src = getFallbackImage(item.category, item.name); }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p>₹{Number(item.price).toFixed(2)} each</p>
                  </div>
                  <div className="quantity">
                    <button onClick={() => decreaseQuantity(item._id)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item._id)}>+</button>
                  </div>
                  <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <div className="summary-row"><span>Items ({cartCount})</span><strong>{cart.length} types</strong></div>
              <div className="summary-row"><span>Delivery fee</span><strong style={{ color:"var(--mint)" }}>Free 🎉</strong></div>
              <div className="summary-row summary-total"><span>Total</span><strong>₹{cartTotal.toFixed(2)}</strong></div>
            </div>

            {/* DELIVERY */}
            <div className="delivery-section">
              <h3>Delivery Address</h3>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter hostel name, room number, street or full address…"
                rows={4}
              />
              <div className="delivery-phone">
                <label>Phone number for delivery updates</label>
                <input type="tel" value={user?.phone || ""} readOnly />
              </div>
              <p className="delivery-hint">Please provide a complete address so your tiffin can be delivered accurately.</p>
            </div>

            {/* PAY */}
<div className="checkout-area">
  <h3>Payment Method</h3>

  <div className="payment-options">

  <label className={`payment-option ${paymentMethod === "Razorpay" ? "selected" : ""}`}>
    <input
      type="radio"
      value="Razorpay"
      checked={paymentMethod === "Razorpay"}
      onChange={(e) => setPaymentMethod(e.target.value)}
    />

    <div className="payment-option-content">
      <strong>💳 Pay Online</strong>
      <span>Secure payment via Razorpay</span>
    </div>
  </label>

  <label className={`payment-option ${paymentMethod === "COD" ? "selected" : ""}`}>
    <input
      type="radio"
      value="COD"
      checked={paymentMethod === "COD"}
      onChange={(e) => setPaymentMethod(e.target.value)}
    />

    <div className="payment-option-content">
      <strong>💵 Pay on Delivery</strong>
      <span>Pay with cash when your order arrives</span>
    </div>
  </label>

</div>
<div className="delivery-info">
  <strong>🍱 Lunch Delivery</strong>
  <span>
    Delivery date: {getDeliveryDate().toLocaleDateString()}
  </span>
  <span>Delivery time: 1:00 PM - 2:00 PM</span>
  <span>Order before 11:00 AM for today's lunch delivery.</span>
</div>
  <button className="checkout-button" onClick={startPayment}>
    {paymentMethod === "COD"
      ? `Place COD Order ₹${cartTotal.toFixed(2)}`
      : `Pay ₹${cartTotal.toFixed(2)} via Razorpay`}
  </button>
</div>
          </section>
        )}

      </main>
      <MobileBottomNav screen={screen} onNav={goTo} />
    </div>
  );
}

export default App;
