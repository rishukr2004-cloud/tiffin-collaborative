import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);
const [adminSubscriptions, setAdminSubscriptions] = useState([]);
const [adminMenuItems, setAdminMenuItems] = useState([]);
const [adminStats, setAdminStats] = useState({
  totalOrders: 0,
  cancelledOrders: 0,
  pendingPayments: 0,
  pendingPaymentAmount: 0,
  placedOrders: 0,
  preparingOrders: 0,
  outForDeliveryOrders: 0,
  deliveredOrders: 0,
  todayOrders: 0,
  todayRevenue: 0,
  totalRevenue: 0,
  activeSubscriptions: 0,
  totalMenuItems: 0,
});
const [orders, setOrders] = useState([]);

  const [subscription, setSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

const [menuItems, setMenuItems] = useState([]);
const [cart, setCart] = useState([]);
const [deliveryAddress, setDeliveryAddress] = useState("");

const [menuForm, setMenuForm] = useState({
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  available: true,
});

const [editingMenuId, setEditingMenuId] = useState(null);

  // Restore existing session
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setScreen("login");
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        return data;
      })
      .then((data) => {
  setUser(data.user);

  if (data.user?.role === "admin") {
  setScreen("admin-dashboard");
} else {
  setScreen("dashboard");
}
})
      .catch(() => {
        localStorage.removeItem("token");
        setScreen("login");
      });
  }, []);

  // Load menu after login
  useEffect(() => {
    if (screen !== "dashboard") return;

    const token = localStorage.getItem("token");

    if (!token) return;

    fetch(`${API_URL}/api/menu`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load menu");
        }

        return data;
      })
      .then((data) => {
        setMenuItems(data.menuItems || []);
      })
      .catch((err) => {
        console.error("Menu error:", err);
        setError("Could not load menu.");
      });
  }, [screen]);

  const login = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);

      setUser(data.user);
      setPassword("");
      setScreen("dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const register = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);

      setUser(data.user);
      setPassword("");
      setScreen("dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCart([]);
    setScreen("login");
  };
  const startPayment = async () => {
  console.log("START PAYMENT CLICKED");

  const token = localStorage.getItem("token");

  console.log("TOKEN EXISTS:", !!token);
  console.log("CART LENGTH:", cart.length);
  console.log("DELIVERY ADDRESS:", deliveryAddress);

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  if (!cart.length) {
    setError("Your cart is empty.");
    return;
  }

  if (!deliveryAddress.trim()) {
    setError("Please enter your delivery address.");
    return;
  }

  // Check item availability before opening Razorpay
const orderItems = cart.map((item) => ({
  menuItem: item._id,
  quantity: item.quantity,
}));

const availabilityResponse = await fetch(
  `${API_URL}/api/payments/check-availability`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: orderItems,
    }),
  }
);

const availabilityData =
  await availabilityResponse.json();

if (!availabilityResponse.ok) {
  throw new Error(
    availabilityData.message ||
      "One or more items are unavailable"
  );
}

console.log(
  "ITEM AVAILABILITY CHECK PASSED ✅"
);

  // Check that all cart items are still available
const unavailableItems = cart.filter(
  (item) => item.available === false
);

if (unavailableItems.length > 0) {
  setError(
    `${unavailableItems
      .map((item) => item.name)
      .join(", ")} is no longer available. Please remove it from your cart.`
  );
  return;
}

  try {
    setError("");
    setSuccess("");

    console.log("CREATING PAYMENT ORDER...");

    // =====================================
    // STEP 1: CREATE RAZORPAY PAYMENT ORDER
    // =====================================
    console.log("CART TOTAL BEFORE PAYMENT:", cartTotal);
    console.log("AMOUNT SENT TO BACKEND:", Number(cartTotal.toFixed(2)));
    const response = await fetch(
      `${API_URL}/api/payments/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
       body: JSON.stringify({
  items: cart.map((item) => ({
    menuItem: item._id,
    quantity: item.quantity,
  })),
}),
      }
    );

    const data = await response.json();

    console.log("PAYMENT ORDER RESPONSE:", response.status);

    if (!response.ok) {
      throw new Error(
        data.message || "Could not create payment order"
      );
    }

    // =====================================
    // STEP 2: OPEN RAZORPAY CHECKOUT
    // =====================================

    const options = {
      key: data.keyId,

      amount: data.order.amount,

      currency: data.order.currency,

      name: "TiffinGo",

      description: "TiffinGo Food Order",

      order_id: data.order.id,

      handler: async function (paymentResponse) {
        console.log(
          "RAZORPAY PAYMENT SUCCESS:",
          paymentResponse
           );


        try {
          setError("");
          setSuccess(
            "Payment successful. Verifying payment..."
          );

          // =====================================
          // STEP 3: PREPARE ITEMS FOR BACKEND
          // =====================================

          const orderItems = cart.map((item) => ({
            menuItem: item._id,
            quantity: item.quantity,
          }));

          // =====================================
          // STEP 4: VERIFY PAYMENT ON BACKEND
          // =====================================

          const verifyResponse = await fetch(
            `${API_URL}/api/payments/verify`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,

                items: orderItems,

                deliveryAddress:
                  deliveryAddress.trim(),

                phone: user?.phone || "",
              }),
            }
          );

          const verifyData =
            await verifyResponse.json();

          console.log(
            "PAYMENT VERIFICATION RESPONSE:",
            verifyResponse.status
          );

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData.message ||
                "Payment verification failed"
            );
          }

          // =====================================
          // STEP 5: PAYMENT + ORDER SUCCESS
          // =====================================

          console.log(
            "ORDER CREATED:",
            verifyData.order
          );

          setSuccess(
            `Payment successful! Order placed successfully. Order ID: ${verifyData.order._id}`
          );

          setCart([]);

          setDeliveryAddress("");
        } catch (verificationError) {
          console.error(
            "Payment verification error:",
            verificationError
          );

          setError(
            verificationError.message ||
              "Payment verification failed"
          );
        }
      },
               modal: {
        ondismiss: function () {
          console.log("RAZORPAY CHECKOUT CLOSED");

          setError(
            "Payment was cancelled. Your order was not placed."
          );

          setSuccess("");
        },
      },

      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },

      theme: {
        color: "#f97316",
      },
    };

    console.log(
      "Razorpay object:",
      window.Razorpay
    );

    const razorpay =
      new window.Razorpay(options);

    console.log("Opening Razorpay...");

    razorpay.open();

  } catch (err) {
    console.error("Payment error:", err);

    setError(err.message);
  }
};
   const loadOrders = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not load orders"
      );
    }


setOrders(data.orders || []);
  } catch (err) {
    console.error("Orders error:", err);
    setError(err.message);
  }
};
const loadAdminOrders = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/orders/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not load admin orders"
      );
    }

  

setAdminOrders(data.orders || []);
  } catch (err) {
    console.error("Admin orders error:", err);
    setError(err.message);
  }
};
const loadAdminStats = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/admin/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Could not load admin dashboard stats"
      );
    }

    setAdminStats(
  data.stats || {
    totalOrders: 0,
    cancelledOrders: 0,
    pendingPayments: 0,
    pendingPaymentAmount: 0,
    placedOrders: 0,
    preparingOrders: 0,
    outForDeliveryOrders: 0,
    deliveredOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalMenuItems: 0,
  }
);
  } catch (err) {
    console.error(
      "Admin stats error:",
      err
    );

    setError(err.message);
  }
};

const loadAdminSubscriptions = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/subscriptions/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Could not load admin subscriptions"
      );
    }

    setAdminSubscriptions(
      data.subscriptions || []
    );
  } catch (err) {
    console.error(
      "Admin subscriptions error:",
      err
    );

    setError(err.message);
  }
};



// =====================================
// ADMIN MENU: LOAD ALL MENU ITEMS
// =====================================

const loadAdminMenu = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/api/menu/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not load admin menu"
      );
    }

    setAdminMenuItems(data.menuItems || []);
  } catch (err) {
    console.error("Admin menu error:", err);
    setError(err.message);
  }
};

// =====================================
// ADMIN MENU: ADD MENU ITEM
// =====================================

const addMenuItem = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/api/menu`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(menuForm),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not add menu item"
      );
    }

    setSuccess("Menu item added successfully.");

    setMenuForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      available: true,
    });

    await loadAdminMenu();
  } catch (err) {
    console.error("Add menu item error:", err);
    setError(err.message);
  }
};

// =====================================
// ADMIN MENU: UPDATE MENU ITEM
// =====================================

const updateMenuItem = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  if (!editingMenuId) {
    setError("No menu item selected for editing.");
    return;
  }

  try {
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/api/menu/${editingMenuId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(menuForm),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not update menu item"
      );
    }

    setSuccess("Menu item updated successfully.");

    setEditingMenuId(null);

    setMenuForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      available: true,
    });

    await loadAdminMenu();
  } catch (err) {
    console.error("Update menu item error:", err);
    setError(err.message);
  }
};

// =====================================
// ADMIN MENU: TOGGLE AVAILABILITY
// =====================================

const toggleMenuAvailability = async (item) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/api/menu/${item._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          available: !item.available,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Could not change menu item availability"
      );
    }

    setSuccess(
      `${item.name} is now ${
        data.menuItem.available
          ? "available"
          : "unavailable"
      }.`
    );

    await loadAdminMenu();
  } catch (err) {
    console.error(
      "Toggle availability error:",
      err
    );

    setError(err.message);
  }
};

// =====================================
// ADMIN MENU: DELETE MENU ITEM
// =====================================

const deleteMenuItem = async (itemId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/api/menu/${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not delete menu item"
      );
    }

    setSuccess("Menu item deleted successfully.");

    await loadAdminMenu();
  } catch (err) {
    console.error(
      "Delete menu item error:",
      err
    );

    setError(err.message);
  }
};

// =====================================
// ADMIN MENU: START EDITING
// =====================================

const startEditingMenuItem = (item) => {
  setEditingMenuId(item._id);

  setMenuForm({
    name: item.name || "",
    description: item.description || "",
    price: item.price ?? "",
    category: item.category || "",
    image: item.image || "",
    available:
      item.available !== undefined
        ? item.available
        : true,
  });

  setError("");
  setSuccess("");
};

// =====================================
// ADMIN MENU: CANCEL EDITING
// =====================================

const cancelEditingMenuItem = () => {
  setEditingMenuId(null);

  setMenuForm({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    available: true,
  });

  setError("");
  setSuccess("");
};

useEffect(() => {
  if (
    screen === "admin-dashboard" &&
    user?.role === "admin"
  ) {
    loadAdminStats();
  }

  if (
    screen === "admin" &&
    user?.role === "admin"
  ) {
    loadAdminOrders();
  }

  if (
    screen === "admin-subscriptions" &&
    user?.role === "admin"
  ) {
    loadAdminSubscriptions();
  }

  if (screen === "subscription") {
    loadSubscriptionHistory();
  }
}, [screen, user]);
const loadSubscription = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/subscriptions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not load subscription"
      );
    }

    setSubscription(data.subscription || null);
  } catch (err) {
    console.error("Subscription error:", err);
    setError(err.message);
  }
};
const loadSubscriptionHistory = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError(
      "Your session has expired. Please login again."
    );
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/subscriptions/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Could not load subscription history"
      );
    }

    setSubscriptionHistory(
      data.subscriptions || []
    );
  } catch (err) {
    console.error(
      "Subscription history error:",
      err
    );

    setError(err.message);
  }
};
  const addToCart = (item) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existing) {
        return currentCart.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (screen === "loading") {
    return (
      <div className="app">
        <div className="loading-card">
          <h1>TiffinGo</h1>
          <p>Checking your session...</p>
        </div>
      </div>
    );
  }

  if (screen === "login") {
    return (
      <div className="app auth-page">
        <div className="auth-card">
          <h1>TiffinGo</h1>
          <p className="auth-subtitle">
            Login to continue
          </p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={login}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit">
              Login
            </button>
          </form>

          <p className="switch-text">
            Don't have an account?
          </p>

          <button
            className="secondary-button"
            onClick={() => {
              setError("");
              setScreen("register");
            }}
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  if (screen === "register") {
    return (
      <div className="app auth-page">
        <div className="auth-card">
          <h1>TiffinGo</h1>
          <p className="auth-subtitle">
            Create your account
          </p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={register}>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password (minimum 6 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            <button type="submit">
              Create Account
            </button>
          </form>

          <p className="switch-text">
            Already have an account?
          </p>

          <button
            className="secondary-button"
            onClick={() => {
              setError("");
              setScreen("login");
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
     // =====================================
// ADMIN DASHBOARD SCREEN
// =====================================

if (screen === "admin-dashboard") {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>TiffinGo Admin</strong>
        </div>

        <div className="nav-right">
          <button
            className="nav-button"
            onClick={() => {
              setError("");
              setSuccess("");
              loadAdminStats();
              setScreen("admin-dashboard");
            }}
          >
            📊 Dashboard
          </button>

          <button
            className="nav-button"
            onClick={() => {
              setError("");
              setSuccess("");
              loadAdminOrders();
              setScreen("admin");
            }}
          >
            📦 Orders
          </button>

          <button
            className="nav-button"
            onClick={() => {
              setError("");
              setSuccess("");
              loadAdminSubscriptions();
              setScreen("admin-subscriptions");
            }}
          >
            ⭐ Subscriptions
          </button>

          <button
            className="nav-button"
            onClick={() => {
              setError("");
              setSuccess("");
              loadAdminMenu();
            }}
          >
            🍱 Menu
          </button>

          <button
            className="nav-button"
            onClick={() => setScreen("dashboard")}
          >
            🏠 Customer View
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">
            Administrator
          </p>

          <h1>Dashboard Overview</h1>

          <p>
            Here's an overview of your TiffinGo business.
          </p>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        {/* =====================================
            STATISTICS CARDS
        ===================================== */}
        <h2 className="admin-stats-title">
  📊 Orders
</h2>

<section className="menu-grid">

          {/* TOTAL ORDERS */}

          <div className="menu-card">
            <div className="menu-placeholder">
              📦
            </div>

            <div className="menu-content">
              <p className="menu-category">
                ORDERS
              </p>

              <h3>
                Total Orders
              </h3>

              <div className="menu-bottom">
                <strong>
                  {adminStats.totalOrders}
                </strong>
              </div>
            </div>
          </div>

          {/* TODAY'S ORDERS */}

          <div className="menu-card">
            <div className="menu-placeholder">
              📅
            </div>

            <div className="menu-content">
              <p className="menu-category">
                TODAY
              </p>

              <h3>
                Today's Orders
              </h3>

              <div className="menu-bottom">
                <strong>
                  {adminStats.todayOrders}
                </strong>
              </div>
            </div>
          </div>
          {/* TODAY'S REVENUE */}

<div className="menu-card">
  <div className="menu-placeholder">
    💰
  </div>

  <div className="menu-content">
    <p className="menu-category">
      TODAY
    </p>

    <h3>
      Today's Revenue
    </h3>

    <div className="menu-bottom">
      <strong>
        ₹
        {Number(
          adminStats.todayRevenue
        ).toFixed(2)}
      </strong>
    </div>
  </div>
</div>



{/* TOTAL REVENUE */}

          <div className="menu-card">
            <div className="menu-placeholder">
              💰
            </div>

            <div className="menu-content">
              <p className="menu-category">
                REVENUE
              </p>

              <h3>
                Total Revenue
              </h3>

              <div className="menu-bottom">
                <strong>
                  ₹
                  {Number(
                    adminStats.totalRevenue
                  ).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          {/* ACTIVE SUBSCRIPTIONS */}

          <div className="menu-card">
            <div className="menu-placeholder">
              ⭐
            </div>

            <div className="menu-content">
              <p className="menu-category">
                SUBSCRIPTIONS
              </p>

              <h3>
                Active Subscriptions
              </h3>

              <div className="menu-bottom">
                <strong>
                  {adminStats.activeSubscriptions}
                </strong>
              </div>
            </div>
          </div>

          {/* TOTAL MENU ITEMS */}

          <div className="menu-card">
            <div className="menu-placeholder">
              🍱
            </div>

            <div className="menu-content">
              <p className="menu-category">
                MENU
              </p>

              <h3>
                Total Menu Items
              </h3>

              <div className="menu-bottom">
                <strong>
                  {adminStats.totalMenuItems}
                </strong>
              </div>
            </div>
          </div>
          {/* CANCELLED ORDERS */}

<div className="menu-card">
  <div className="menu-placeholder">
    ❌
  </div>

  <div className="menu-content">
    <p className="menu-category">
      CANCELLED
    </p>

    <h3>
      Cancelled Orders
    </h3>

    <div className="menu-bottom">
      <strong>
        {adminStats.cancelledOrders}
      </strong>
    </div>
  </div>
</div>
{/* PENDING PAYMENTS */}

<div className="menu-card">
  <div className="menu-placeholder">
    💳
  </div>

  <div className="menu-content">
    <p className="menu-category">
      PAYMENTS
    </p>

    <h3>
      Pending Payments
    </h3>

    <div className="menu-bottom">
      <strong>
        {adminStats.pendingPayments}
      </strong>
    </div>
  </div>
</div>
{/* PENDING PAYMENT AMOUNT */}

<div className="menu-card">
  <div className="menu-placeholder">
    💰
  </div>

  <div className="menu-content">
    <p className="menu-category">
      PAYMENTS
    </p>

    <h3>
      Pending Payment Amount
    </h3>

    <div className="menu-bottom">
      <strong>
        ₹
        {Number(
          adminStats.pendingPaymentAmount
        ).toFixed(2)}
      </strong>
    </div>
  </div>
</div>
       {/* PLACED ORDERS */}

<div className="menu-card">
  <div className="menu-placeholder">
    🟠
  </div>

  <div className="menu-content">
    <p className="menu-category">
      ORDERS
    </p>

    <h3>
      Placed Orders
    </h3>

    <div className="menu-bottom">
      <strong>
        {adminStats.placedOrders}
      </strong>
    </div>
  </div>
</div>

{/* PREPARING ORDERS */}

<div className="menu-card">
  <div className="menu-placeholder">
    🔵
  </div>

  <div className="menu-content">
    <p className="menu-category">
      ORDERS
    </p>

    <h3>
      Preparing Orders
    </h3>

    <div className="menu-bottom">
      <strong>
        {adminStats.preparingOrders}
      </strong>
    </div>
  </div>
</div>

{/* OUT FOR DELIVERY */}

<div className="menu-card">
  <div className="menu-placeholder">
    🚚
  </div>

  <div className="menu-content">
    <p className="menu-category">
      DELIVERY
    </p>

    <h3>
      Out for Delivery
    </h3>

    <div className="menu-bottom">
      <strong>
        {adminStats.outForDeliveryOrders}
      </strong>
    </div>
  </div>
</div>

{/* DELIVERED ORDERS */}

<div className="menu-card">
  <div className="menu-placeholder">
    🟢
  </div>

  <div className="menu-content">
    <p className="menu-category">
      ORDERS
    </p>

    <h3>
      Delivered Orders
    </h3>

    <div className="menu-bottom">
      <strong>
        {adminStats.deliveredOrders}
      </strong>
    </div>
  </div>
</div>

</section>

        

        {/* =====================================
            QUICK ACTIONS
        ===================================== */}

        <section className="orders-section">
          <div className="section-heading">
            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Manage your TiffinGo system.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <button
              className="checkout-button"
              onClick={() => {
                setError("");
                setSuccess("");
                loadAdminOrders();
                setScreen("admin");
              }}
            >
              📦 Manage Orders
            </button>

            <button
              className="checkout-button"
              onClick={() => {
                setError("");
                setSuccess("");
                loadAdminSubscriptions();
                setScreen("admin-subscriptions");
              }}
            >
              ⭐ Manage Subscriptions
            </button>

            <button
  className="checkout-button"
  onClick={() => {
    setError("");
    setSuccess("");
    loadAdminMenu();
    setScreen("admin-menu");
  }}
>
  🍱 Manage Menu
</button>
          </div>
        </section>
      </main>
    </div>
  );
}
if (screen === "admin") {
  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update order status"
        );
      }

      setAdminOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );

      setSuccess(
        `Order status changed to "${status}".`
      );
    } catch (err) {
      console.error("Update status error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>TiffinGo Admin</strong>
        </div>

        <div className="nav-right">

          <button
  className="nav-button"
  onClick={() => {
    setError("");
    setSuccess("");
    loadAdminStats();
    setScreen("admin-dashboard");
  }}
>
  📊 Dashboard
</button>
  <button
    className="nav-button"
    onClick={() => setScreen("admin")}
  >
    📦 Orders
  </button>

  <button
  className="nav-button"
  onClick={() => setScreen("admin-subscriptions")}
>
  ⭐ Subscriptions
</button>
  <button
  className="nav-button"
  onClick={() => {
    setError("");
    setSuccess("");
    loadAdminMenu();
    setScreen("admin-menu");
  }}
>
  🍱 Menu
</button>
  <button
    className="nav-button"
    onClick={() => setScreen("dashboard")}
  >
    🏠 Customer View
  </button>

  <button
    className="logout-btn"
    onClick={logout}
  >
    Logout
  </button>
</div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">
            Administrator
          </p>

          <h1>Order Management</h1>

          <p>
            View and manage all TiffinGo customer orders.
          </p>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        {adminOrders.length === 0 ? (
          <div className="empty-card">
            <div style={{ fontSize: "50px" }}>
              📦
            </div>

            <h2>No orders yet</h2>

            <p>
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {adminOrders.map((order) => (
              <div
                className="order-card"
                key={order._id}
              >
                <div className="order-header">
                  <div>
                    <p className="small-text">
                      Order
                    </p>

                    <strong>
                      #{order._id
                        .slice(-8)
                        .toUpperCase()}
                    </strong>

                    <p>
                      Customer:{" "}
                      {order.user?.name ||
                        "Unknown customer"}
                    </p>

                    <p>
                      Email:{" "}
                      {order.user?.email || "N/A"}
                    </p>

                    <p>
                      Phone:{" "}
                      {order.phone ||
                        order.user?.phone ||
                        "N/A"}
                    </p>
                  </div>

                  <span
                    className={`order-status ${String(
                      order.status
                    )
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map(
                    (item, index) => (
                      <div
                        className="order-item"
                        key={`${order._id}-${index}`}
                      >
                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <p>
                            ₹
                            {Number(
                              item.price
                            ).toFixed(2)}
                            {" × "}
                            {item.quantity}
                          </p>
                        </div>

                        <strong>
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                <div className="order-footer">
  <div>
    <span>
      {new Date(order.createdAt).toLocaleString()}
    </span>

    {order.deliveryAddress && (
      <p className="order-address">
        📍 {order.deliveryAddress}
      </p>
    )}

    <p className="order-payment">
      💳 Payment:{" "}
      <strong>
        {order.paymentStatus || "Pending"}
      </strong>
    </p>

    {order.status === "Placed" && (
      <button
        className="cancel-order-button"
        onClick={async () => {
          const token = localStorage.getItem("token");

          try {
            setError("");
            setSuccess("");

            const response = await fetch(
              `${API_URL}/api/orders/${order._id}/cancel`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || "Could not cancel order"
              );
            }

            setSuccess(
  "Order cancelled successfully."
);

await loadAdminOrders();
          } catch (err) {
            console.error(
              "Cancel order error:",
              err
            );

            setError(err.message);
          }
        }}
      >
        Cancel Order
      </button>
    )}
  </div>

  <strong>
    Total: ₹
    {Number(order.totalAmount).toFixed(2)}
  </strong>
</div>

                <div className="admin-status-controls">
                  <p>
                    Update order status:
                  </p>

                  <div className="status-buttons">
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order._id,
                          "Placed"
                        )
                      }
                    >
                      Placed
                    </button>

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order._id,
                          "Preparing"
                        )
                      }
                    >
                      Preparing
                    </button>

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order._id,
                          "Out for Delivery"
                        )
                      }
                    >
                      Out for Delivery
                    </button>

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order._id,
                          "Delivered"
                        )
                      }
                    >
                      Delivered
                    </button>

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order._id,
                          "Cancelled"
                        )
                      }
                    >
                      Cancelled
                    </button>
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


// =====================================
// ADMIN SUBSCRIPTIONS SCREEN
// =====================================

if (screen === "admin-subscriptions") {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>TiffinGo Admin</strong>
        </div>

        <div className="nav-right">
          <button
            className="nav-button"
            onClick={() => setScreen("admin")}
          >
            📦 Orders
          </button>
          <button
  className="nav-button"
  onClick={() => {
    setError("");
    setSuccess("");
    loadAdminMenu();
    setScreen("admin-menu");
  }}
>
  🍱 Menu
</button>
          <button
            className="nav-button"
            onClick={() => setScreen("dashboard")}
          >
            🏠 Customer View
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">
            Administrator
          </p>

          <h1>Subscription Management</h1>

          <p>
            View all active and cancelled TiffinGo subscriptions.
          </p>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        {adminSubscriptions.length === 0 ? (
          <div className="empty-card">
            <div style={{ fontSize: "50px" }}>
              ⭐
            </div>

            <h2>No subscriptions yet</h2>

            <p>
              Customer subscriptions will appear here.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {adminSubscriptions.map((subscription) => (
              <div
                className="order-card"
                key={subscription._id}
              >
                <div className="order-header">
                  <div>
                    <p className="small-text">
                      Subscription
                    </p>

                    <strong>
                      #{subscription._id
                        .slice(-8)
                        .toUpperCase()}
                    </strong>

                    <p>
                      Customer:{" "}
                      {subscription.user?.name ||
                        "Unknown customer"}
                    </p>

                    <p>
                      Email:{" "}
                      {subscription.user?.email ||
                        "N/A"}
                    </p>

                    <p>
                      Phone:{" "}
                      {subscription.user?.phone ||
                        "N/A"}
                    </p>
                  </div>

                  <span
                    className={`order-status ${String(
                      subscription.status
                    )
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {subscription.status}
                  </span>
                </div>

                <div className="order-items">
                  <div className="order-item">
                    <div>
                      <strong>
                        {subscription.plan} Plan
                      </strong>

                      <p>
                        {subscription.mealsPerDay} meal
                        {subscription.mealsPerDay !== 1
                          ? "s"
                          : ""}{" "}
                        per day
                      </p>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        subscription.price
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="order-footer">
                  <div>
                    <p>
                      Start:{" "}
                      {new Date(
                        subscription.startDate
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      End:{" "}
                      {new Date(
                        subscription.endDate
                      ).toLocaleDateString()}
                    </p>

                    {subscription.deliveryAddress && (
                      <p className="order-address">
                        📍{" "}
                        {subscription.deliveryAddress}
                      </p>
                    )}
<p className="order-payment">
  💳 Payment:{" "}
  <strong>
    {subscription.paymentStatus || "Pending"}
  </strong>
</p>

                  </div>

                  <strong>
                    {subscription.status}
                  </strong>
                </div>
                {subscription.status === "Active" && (
  <button
    className="cancel-order-button"
    onClick={async () => {
      const token = localStorage.getItem("token");

      try {
        setError("");
        setSuccess("");

        const response = await fetch(
          `${API_URL}/api/subscriptions/${subscription._id}/cancel`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Could not cancel subscription"
          );
        }

        setSuccess(
          "Subscription cancelled successfully."
        );

        await loadAdminSubscriptions();
      } catch (err) {
        console.error(
          "Cancel subscription error:",
          err
        );

        setError(err.message);
      }
    }}
  >
    Cancel Subscription
  </button>
)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
  // =====================================
// ADMIN MENU MANAGEMENT SCREEN
// =====================================

if (screen === "admin-menu") {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>TiffinGo Admin</strong>
        </div>

        <div className="nav-right">
          <button
            className="nav-button"
            onClick={() => {
              setError("");
              setSuccess("");
              loadAdminOrders();
              setScreen("admin");
            }}
          >
            📦 Orders
          </button>

          <button
            className="nav-button"
            onClick={() => {
              setError("");
              setSuccess("");
              loadAdminSubscriptions();
              setScreen("admin-subscriptions");
            }}
          >
            ⭐ Subscriptions
          </button>

          <button
            className="nav-button"
            onClick={() => {
              setError("");
              setSuccess("");
              loadAdminMenu();
            }}
          >
            🍱 Menu
          </button>

          <button
            className="nav-button"
            onClick={() => setScreen("dashboard")}
          >
            🏠 Customer View
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">
            Administrator
          </p>

          <h1>Menu Management</h1>

          <p>
            Add, edit, enable, disable, and delete TiffinGo menu items.
          </p>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        {/* =====================================
            ADD / EDIT MENU FORM
        ===================================== */}

        <section className="cart-section">
          <div className="section-heading">
            <div>
              <h2>
                {editingMenuId
                  ? "Edit Menu Item"
                  : "Add New Menu Item"}
              </h2>

              <p>
                {editingMenuId
                  ? "Update the selected menu item."
                  : "Create a new item for the TiffinGo menu."}
              </p>
            </div>
          </div>

          <div className="delivery-section">
            <input
              type="text"
              placeholder="Item name"
              value={menuForm.name}
              onChange={(event) =>
                setMenuForm({
                  ...menuForm,
                  name: event.target.value,
                })
              }
            />

            <textarea
              placeholder="Description"
              value={menuForm.description}
              onChange={(event) =>
                setMenuForm({
                  ...menuForm,
                  description: event.target.value,
                })
              }
              rows={3}
            />

            <input
              type="number"
              placeholder="Price"
              min="0"
              step="0.01"
              value={menuForm.price}
              onChange={(event) =>
                setMenuForm({
                  ...menuForm,
                  price: event.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Category"
              value={menuForm.category}
              onChange={(event) =>
                setMenuForm({
                  ...menuForm,
                  category: event.target.value,
                })
              }
            />

            <input
              type="url"
              placeholder="Image URL"
              value={menuForm.image}
              onChange={(event) =>
                setMenuForm({
                  ...menuForm,
                  image: event.target.value,
                })
              }
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <input
                type="checkbox"
                checked={menuForm.available}
                onChange={(event) =>
                  setMenuForm({
                    ...menuForm,
                    available: event.target.checked,
                  })
                }
              />

              Available
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                className="checkout-button"
                type="button"
                onClick={
                  editingMenuId
                    ? updateMenuItem
                    : addMenuItem
                }
              >
                {editingMenuId
                  ? "Update Menu Item"
                  : "Add Menu Item"}
              </button>

              {editingMenuId && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cancelEditingMenuItem}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            MENU ITEMS LIST
        ===================================== */}

        <section className="orders-section">
          <div className="section-heading">
            <div>
              <h2>All Menu Items</h2>

              <p>
                Showing available and unavailable items.
              </p>
            </div>

            <strong>
              {adminMenuItems.length} item
              {adminMenuItems.length !== 1
                ? "s"
                : ""}
            </strong>
          </div>

          {adminMenuItems.length === 0 ? (
            <div className="empty-card">
              <div style={{ fontSize: "50px" }}>
                🍱
              </div>

              <h2>No menu items</h2>

              <p>
                Add your first menu item using the form above.
              </p>
            </div>
          ) : (
            <div className="menu-grid">
              {adminMenuItems.map((item) => (
                <div
                  className="menu-card"
                  key={item._id}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="menu-image"
                    />
                  ) : (
                    <div className="menu-placeholder">
                      🍱
                    </div>
                  )}

                  <div className="menu-content">
                    <p className="menu-category">
                      {item.category}
                    </p>

                    <h3>
                      {item.name}
                    </h3>

                    <p className="menu-description">
                      {item.description}
                    </p>

                    <div className="menu-bottom">
                      <strong>
                        ₹
                        {Number(
                          item.price
                        ).toFixed(2)}
                      </strong>

                      <span
                        className={`order-status ${
                          item.available
                            ? "delivered"
                            : "cancelled"
                        }`}
                      >
                        {item.available
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "15px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          startEditingMenuItem(item)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleMenuAvailability(item)
                        }
                      >
                        {item.available
                          ? "🔴 Disable"
                          : "🟢 Enable"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const confirmed =
                            window.confirm(
                              `Are you sure you want to delete "${item.name}"?`
                            );

                          if (confirmed) {
                            deleteMenuItem(item._id);
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

  if (screen === "orders") {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>TiffinGo</strong>
        </div>

        <div className="nav-right">
          <button
            className="nav-button"
            onClick={() => setScreen("dashboard")}
          >
            🏠 Menu
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">
            Order History
          </p>

          <h1>My Orders</h1>

          <p>
            View your previous TiffinGo orders and their status.
          </p>
        </section>

        {error && <div className="error">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-card">
            <div style={{ fontSize: "50px" }}>📦</div>
            <h2>No orders yet</h2>
            <p>
              Your completed orders will appear here.
            </p>

            <button
              className="checkout-button"
              onClick={() => setScreen("dashboard")}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div
                className="order-card"
                key={order._id}
              >
                <div className="order-header">
                  <div>
                    <p className="small-text">
                      Order
                    </p>

                    <strong>
                      #{order._id.slice(-8).toUpperCase()}
                    </strong>
                    
                  </div>

                  <div className="order-tracking">
  {order.status === "Cancelled" ? (
    <div className="tracking-cancelled">
      <span>❌</span>
      <strong>Order Cancelled</strong>
    </div>
  ) : (
    <>
      <div
        className={`tracking-step ${
          ["Placed", "Preparing", "Out for Delivery", "Delivered"].includes(
            order.status
          )
            ? "active"
            : ""
        }`}
      >
        <span>1</span>
        <strong>Placed</strong>
      </div>

      <div
        className={`tracking-step ${
          ["Preparing", "Out for Delivery", "Delivered"].includes(
            order.status
          )
            ? "active"
            : ""
        }`}
      >
        <span>2</span>
        <strong>Preparing</strong>
      </div>

      <div
        className={`tracking-step ${
          ["Out for Delivery", "Delivered"].includes(
            order.status
          )
            ? "active"
            : ""
        }`}
      >
        <span>3</span>
        <strong>Out for Delivery</strong>
      </div>

      <div
        className={`tracking-step ${
          order.status === "Delivered"
            ? "active"
            : ""
        }`}
      >
        <span>4</span>
        <strong>Delivered</strong>
      </div>
    </>
  )}
</div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div
                      className="order-item"
                      key={`${order._id}-${index}`}
                    >
                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <p>
                          ₹{Number(item.price).toFixed(2)}
                          {" × "}
                          {item.quantity}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {(
                          item.price * item.quantity
                        ).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

               <div className="order-footer">
  <div>
    <span>
      {new Date(order.createdAt).toLocaleString()}
    </span>

    {order.deliveryAddress && (
      <p className="order-address">
        📍 {order.deliveryAddress}
      </p>
    )}

    <p className="order-payment">
      💳 Payment:{" "}
      <strong>
        {order.paymentStatus || "Pending"}
      </strong>
    </p>

    {/* CANCEL ORDER BUTTON */}
    {order.status === "Placed" && (
      <button
        type="button"
        className="cancel-order-button"
        onClick={async () => {
          const token = localStorage.getItem("token");

          if (!token) {
            setError(
              "Your session has expired. Please login again."
            );
            return;
          }

          try {
            setError("");
            setSuccess("");

            const response = await fetch(
              `${API_URL}/api/orders/${order._id}/cancel`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message ||
                  "Could not cancel order"
              );
            }

            setSuccess(
              "Order cancelled successfully."
            );

            await loadOrders();
          } catch (err) {
            console.error(
              "Cancel order error:",
              err
            );

            setError(err.message);
          }
        }}
      >
        Cancel Order
      </button>
    )}
  </div>

  <strong>
    Total: ₹
    {Number(order.totalAmount).toFixed(2)}
  </strong>
</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
if (screen === "subscription") {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>TiffinGo</strong>
        </div>

        <div className="nav-right">
          <button
            className="nav-button"
            onClick={() => setScreen("dashboard")}
          >
            🏠 Menu
          </button>
           {user?.role === "admin" && (
  <button
    className="nav-button"
    onClick={() => {
      setError("");
      setSuccess("");
      loadAdminOrders();
      setScreen("admin");
    }}
  >
    🛠️ Admin
  </button>
)}
          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">
            TiffinGo Plans
          </p>

          <h1>Subscription</h1>

          <p>
            Get your daily meals delivered without
            ordering every day.
          </p>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        {subscription ? (
          <div className="subscription-active">
            <div className="subscription-icon">
              ⭐
            </div>

            <p className="small-text">
              Active Subscription
            </p>

            <h2>
              {subscription.plan} Plan
            </h2>

            <div className="subscription-details">
              <div>
                <span>Meals per day</span>
                <strong>
                  {subscription.mealsPerDay}
                </strong>
              </div>

              <div>
                <span>Price</span>
                <strong>
                  ₹{subscription.price}
                </strong>
              </div>

              <div>
                <span>Start date</span>
                <strong>
                  {new Date(
                    subscription.startDate
                  ).toLocaleDateString()}
                </strong>
              </div>

              <div>
                <span>End date</span>
                <strong>
                  {new Date(
                    subscription.endDate
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <button
              className="cancel-subscription"
              onClick={async () => {
                const token =
                  localStorage.getItem("token");

                try {
                  setError("");
                  setSuccess("");

                  const response =
                    await fetch(
                      `${API_URL}/api/subscriptions/cancel`,
                      {
                        method: "PATCH",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                  const data =
                    await response.json();

                  if (!response.ok) {
                    throw new Error(
                      data.message ||
                        "Could not cancel subscription"
                    );
                  }

                 setSubscription(null);

await loadSubscriptionHistory();

setSuccess(
  "Subscription cancelled successfully."
);
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              Cancel Subscription
            </button>
          </div>
        ) : (
          <div className="subscription-plans">
            <div className="plan-card">
              <div className="plan-icon">
                🍱
              </div>

              <h2>Weekly</h2>

              <p className="plan-description">
                Perfect for trying TiffinGo for one
                week.
              </p>

              <div className="plan-price">
                ₹700
                <span>/week</span>
              </div>

              <ul>
                <li>✓ Daily tiffin delivery</li>
                <li>✓ 1 meal per day</li>
                <li>✓ Flexible cancellation</li>
              </ul>

              <button
                className="checkout-button"
                onClick={async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/api/payments/create-subscription-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: "Weekly",
          price: 700,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Could not create subscription payment"
      );
    }

    const options = {
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "TiffinGo",
      description: "TiffinGo Weekly Subscription",
      order_id: data.order.id,

      handler: async function (paymentResponse) {
        try {
          setError("");
          setSuccess(
            "Payment successful. Verifying subscription..."
          );

          const verifyResponse = await fetch(
            `${API_URL}/api/payments/verify-subscription`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,

                plan: "Weekly",
                mealsPerDay: 1,
                deliveryAddress: "",
              }),
            }
          );

          const verifyData =
            await verifyResponse.json();

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData.message ||
                "Subscription payment verification failed"
            );
          }

         setSubscription(
  verifyData.subscription
);

await loadSubscriptionHistory();

setSuccess(
  "Weekly subscription activated successfully!"
);
        } catch (verificationError) {
          console.error(
            "Subscription verification error:",
            verificationError
          );

          setError(
            verificationError.message ||
              "Subscription payment verification failed"
          );
        }
      },

      modal: {
        ondismiss: function () {
          setError(
            "Payment was cancelled. Subscription was not activated."
          );

          setSuccess("");
        },
      },

      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },

      theme: {
        color: "#f97316",
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();
  } catch (err) {
    console.error(
      "Subscription payment error:",
      err
    );

    setError(err.message);
  }
}}
              >
                Choose Weekly
              </button>
            </div>

            <div className="plan-card featured-plan">
              <div className="popular-label">
                MOST POPULAR
              </div>

              <div className="plan-icon">
                👑
              </div>

              <h2>Monthly</h2>

              <p className="plan-description">
                Best value for regular students.
              </p>

              <div className="plan-price">
                ₹2,500
                <span>/month</span>
              </div>

              <ul>
                <li>✓ Daily tiffin delivery</li>
                <li>✓ 1 meal per day</li>
                <li>✓ Better monthly value</li>
                <li>✓ Flexible cancellation</li>
              </ul>

              <button
                className="checkout-button"
                onClick={async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Your session has expired. Please login again.");
    return;
  }

  try {
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/api/payments/create-subscription-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: "Monthly",
          price: 2500,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Could not create subscription payment"
      );
    }

    const options = {
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "TiffinGo",
      description: "TiffinGo Monthly Subscription",
      order_id: data.order.id,

      handler: async function (paymentResponse) {
        try {
          setError("");
          setSuccess(
            "Payment successful. Verifying subscription..."
          );

          const verifyResponse = await fetch(
            `${API_URL}/api/payments/verify-subscription`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,

                plan: "Monthly",
                mealsPerDay: 1,
                deliveryAddress: "",
              }),
            }
          );

          const verifyData =
            await verifyResponse.json();

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData.message ||
                "Subscription payment verification failed"
            );
          }

         setSubscription(
  verifyData.subscription
);

await loadSubscriptionHistory();

setSuccess(
  "Monthly subscription activated successfully!"
);
        } catch (verificationError) {
          console.error(
            "Subscription verification error:",
            verificationError
          );

          setError(
            verificationError.message ||
              "Subscription payment verification failed"
          );
        }
      },

      modal: {
        ondismiss: function () {
          setError(
            "Payment was cancelled. Subscription was not activated."
          );

          setSuccess("");
        },
      },

      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },

      theme: {
        color: "#f97316",
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();
  } catch (err) {
    console.error(
      "Subscription payment error:",
      err
    );

    setError(err.message);
  }
}}
              >
                Choose Monthly
              </button>
            </div>
          </div>
        )}
                {/* SUBSCRIPTION HISTORY */}
        <section className="orders-section">
          <div className="section-heading">
            <div>
              <h2>Subscription History</h2>
              <p>
                View your previous and current subscriptions.
              </p>
            </div>
          </div>

          {subscriptionHistory.length === 0 ? (
            <div className="empty-card">
              <div style={{ fontSize: "50px" }}>
                ⭐
              </div>

              <h2>No subscription history</h2>

              <p>
                Your subscriptions will appear here.
              </p>
            </div>
          ) : (
            <div className="orders-list">
              {subscriptionHistory.map(
                (historySubscription) => (
                  <div
                    className="order-card"
                    key={historySubscription._id}
                  >
                    <div className="order-header">
                      <div>
                        <p className="small-text">
                          Subscription
                        </p>

                        <strong>
                          {historySubscription.plan} Plan
                        </strong>

                        <p>
                          {historySubscription.mealsPerDay} meal
                          {historySubscription.mealsPerDay !== 1
                            ? "s"
                            : ""}{" "}
                          per day
                        </p>
                      </div>

                      <span
                        className={`order-status ${String(
                          historySubscription.status
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {historySubscription.status}
                      </span>
                    </div>

                    <div className="order-items">
                      <div className="order-item">
                        <div>
                          <strong>Price</strong>
                        </div>

                        <strong>
                          ₹
                          {Number(
                            historySubscription.price
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <div className="order-footer">
                      <div>
                        <p>
                          Start:{" "}
                          {new Date(
                            historySubscription.startDate
                          ).toLocaleDateString()}
                        </p>

                        <p>
                          End:{" "}
                          {new Date(
                            historySubscription.endDate
                          ).toLocaleDateString()}
                        </p>

                        {historySubscription.deliveryAddress && (
                          <p className="order-address">
                            📍{" "}
                            {
                              historySubscription.deliveryAddress
                            }
                          </p>
                        )}

                        <p className="order-payment">
  💳 Payment:{" "}
  <strong>
    {historySubscription.paymentStatus || "Pending"}
  </strong>
</p>
                      </div>

                      <strong>
                        {historySubscription.status}
                      </strong>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span>🍱</span>
          <strong>TiffinGo</strong>
        </div>

        <div className="nav-right">
 <button
  className="nav-button"
  onClick={() => {
    setError("");
    setSuccess("");
    loadOrders();
    setScreen("orders");
  }}
>
  📦 My Orders
</button>

  <span className="cart-indicator">
    🛒 {cartCount}
  </span>

  <button
    className="logout-btn"
    onClick={logout}
  >
    Logout
  </button>
<button
  className="nav-button"
  onClick={() => {
    loadSubscription();
    setScreen("subscription");
  }}
>
  ⭐ Subscription
</button>

</div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="small-text">
            Student Dashboard
          </p>

          <h1>
            Welcome, {user?.name || "Student"} 👋
          </h1>

          <p>
            Choose your tiffin and add it to your cart.
          </p>
        </section>

        {error && <div className="error">{error}</div>}

{success && <div className="success">{success}</div>}

        <section className="menu-section">
          <div className="section-heading">
            <div>
              <h2>Today's Menu</h2>
              <p>Fresh meals prepared for you.</p>
            </div>

            <div className="cart-total">
              Cart: ₹{cartTotal.toFixed(2)}
            </div>
          </div>

          {menuItems.length === 0 ? (
            <div className="empty-card">
              <p>No menu items available right now.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {menuItems.map((item) => (
                <div className="menu-card" key={item._id}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="menu-image"
                    />
                  ) : (
                    <div className="menu-placeholder">
                      🍱
                    </div>
                  )}

                  <div className="menu-content">
                    <p className="menu-category">
                      {item.category}
                    </p>

                    <h3>{item.name}</h3>

                    <p className="menu-description">
                      {item.description}
                    </p>

                    <div className="menu-bottom">
                      <strong>
                        ₹{Number(item.price).toFixed(2)}
                      </strong>

                      <button
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {cart.length > 0 && (
          <section className="cart-section">
            <div className="section-heading">
              <div>
                <h2>Your Cart</h2>
                <p>
                  {cartCount} item
                  {cartCount !== 1 ? "s" : ""}
                </p>
              </div>

              <strong>
                Total: ₹{cartTotal.toFixed(2)}
              </strong>
            </div>

            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      ₹{Number(item.price).toFixed(2)} each
                    </p>
                  </div>

                  <div className="quantity">
                    <button
                      onClick={() =>
                        decreaseQuantity(item._id)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        increaseQuantity(item._id)
                      }
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    ₹
                    {(
                      item.price * item.quantity
                    ).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

<div className="checkout-summary">
  <h3>Order Summary</h3>

  <div className="summary-row">
    <span>Items</span>
    <strong>{cart.length}</strong>
  </div>

  <div className="summary-row">
    <span>Subtotal</span>
    <strong>₹{cartTotal.toFixed(2)}</strong>
  </div>

  <div className="summary-row summary-total">
    <span>Total</span>
    <strong>₹{cartTotal.toFixed(2)}</strong>
  </div>
</div>

<div className="delivery-section">
  <h3>Delivery Address</h3>

  <textarea
    value={deliveryAddress}
    onChange={(event) =>
      setDeliveryAddress(event.target.value)
    }
    placeholder="Enter your hostel, room number, street or delivery address"
    rows={4}
  />

  <div className="delivery-phone">
    <label>Phone Number</label>

    <input
      type="tel"
      value={user?.phone || ""}
      readOnly
    />

    <p className="delivery-hint">
      This phone number will be used for delivery updates.
    </p>
  </div>

  <p className="delivery-hint">
    Please provide a complete address so your tiffin can be delivered.
  </p>
</div>
           <div className="checkout-area">

  

  <button
    className="checkout-button"
    onClick={startPayment}
  >
    Pay ₹{cartTotal.toFixed(2)}
  </button>

</div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;