const express = require("express");

const crypto = require("crypto");

const razorpay = require("../config/razorpay");

const Order = require("../models/Order");

const Subscription = require("../models/Subscription");

const MenuItem = require("../models/MenuItem");

const { protect } = require("../middleware/authMiddleware");

const {
  getNextLunchDeliveryDate,
  getDeliveryWindow,
} = require("../utils/delivery");

const router = express.Router();

// =====================================
// TEST PAYMENT ROUTE
// GET /api/payments/test
// =====================================

router.get("/test", (req, res) => {
  console.log("PAYMENT TEST ROUTE REACHED");

  res.json({
    message: "Payment route is working",
  });
});

// =====================================
// CHECK MENU ITEM AVAILABILITY
// POST /api/payments/check-availability
// =====================================

router.post("/check-availability", protect, async (req, res) => {
  console.log("CHECK AVAILABILITY ROUTE REACHED");

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const menuItemIds = items.map((item) => item.menuItem);

    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
    });

    const menuMap = new Map(
      menuItems.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    const unavailableItems = [];

    for (const item of items) {
      const menuItem = menuMap.get(
        item.menuItem.toString()
      );

      if (!menuItem) {
        unavailableItems.push({
          name: item.name || "Unknown item",
          reason: "Item no longer exists",
        });
      } else if (!menuItem.available) {
        unavailableItems.push({
          name: menuItem.name,
          reason: "Item is currently unavailable",
        });
      }
    }

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        available: false,
        message: "One or more items are unavailable",
        unavailableItems,
      });
    }

    return res.json({
      available: true,
      message: "All cart items are available",
    });
  } catch (error) {
    console.error(
      "Check availability error:",
      error
    );

    return res.status(500).json({
      message: "Could not check item availability",
    });
  }
});

// =====================================
// CREATE RAZORPAY PAYMENT ORDER
// POST /api/payments/create-order
// =====================================

router.post("/create-order", protect, async (req, res) => {
  console.log("PAYMENT CREATE-ORDER ROUTE REACHED");

  try {
    const { items } = req.body;

if (!items || !Array.isArray(items) || items.length === 0) {
  return res.status(400).json({
    message: "Your cart is empty",
  });
}

// Get actual menu items from database
const menuItemIds = items.map(
  (item) => item.menuItem
);

const menuItems = await MenuItem.find({
  _id: { $in: menuItemIds },
  available: true,
});

if (menuItems.length !== items.length) {
  return res.status(400).json({
    message: "One or more menu items are unavailable",
  });
}

const menuMap = new Map(
  menuItems.map((item) => [
    item._id.toString(),
    item,
  ])
);

let calculatedTotal = 0;

for (const item of items) {
  const menuItem = menuMap.get(
    item.menuItem.toString()
  );

  if (!menuItem) {
    return res.status(400).json({
      message: "Invalid menu item",
    });
  }

  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      message: "Invalid item quantity",
    });
  }

  calculatedTotal += menuItem.price * quantity;
}

const finalAmount = Number(
  calculatedTotal.toFixed(2)
);

console.log(
  "SERVER CALCULATED PAYMENT AMOUNT:",
  finalAmount
);

const options = {
  amount: Math.round(finalAmount * 100),
  currency: "INR",
  receipt: `tiffingo_${Date.now()}`,
};

    const razorpayOrder =
      await razorpay.orders.create(options);

    return res.status(201).json({
      message: "Payment order created successfully",
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    return res.status(500).json({
      message: "Could not create payment order",
    });
  }
});

// =====================================
// CREATE RAZORPAY SUBSCRIPTION PAYMENT ORDER
// POST /api/payments/create-subscription-order
// =====================================

router.post(
  "/create-subscription-order",
  protect,
  async (req, res) => {
    console.log(
      "SUBSCRIPTION CREATE-PAYMENT ROUTE REACHED"
    );

    try {
      const { plan, price } = req.body;

      if (!plan || !price) {
        return res.status(400).json({
          message: "Plan and price are required",
        });
      }

      if (!["Weekly", "Monthly"].includes(plan)) {
        return res.status(400).json({
          message: "Invalid subscription plan",
        });
      }

      const expectedPrices = {
        Weekly: 700,
        Monthly: 2500,
      };

      if (Number(price) !== expectedPrices[plan]) {
        return res.status(400).json({
          message: "Invalid subscription price",
        });
      }

      const existingSubscription =
        await Subscription.findOne({
          user: req.user.userId,
          status: "Active",
        });

      if (existingSubscription) {
        return res.status(409).json({
          message:
            "You already have an active subscription",
        });
      }

      const razorpayOrder =
        await razorpay.orders.create({
          amount: Math.round(
            expectedPrices[plan] * 100
          ),
          currency: "INR",
          receipt: `subscription_${Date.now()}`,
        });

      console.log(
        "SUBSCRIPTION RAZORPAY ORDER CREATED:",
        razorpayOrder.id
      );

      return res.status(201).json({
        message:
          "Subscription payment order created successfully",
        order: razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error(
        "Create subscription payment order error:",
        error
      );

      return res.status(500).json({
        message:
          "Could not create subscription payment order",
      });
    }
  }
);

// =====================================
// VERIFY RAZORPAY PAYMENT + CREATE ORDER
// POST /api/payments/verify
// =====================================

router.post("/verify", protect, async (req, res) => {
  console.log("PAYMENT VERIFY ROUTE REACHED");

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      deliveryAddress,
      phone,
    } = req.body;

    // ---------------------------------
    // Basic validation
    // ---------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing payment verification details",
      });
    }

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    // ---------------------------------
    // Verify Razorpay signature
    // ---------------------------------

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error(
        "Invalid Razorpay payment signature"
      );

      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    console.log("Razorpay signature verified ✅");

    // ---------------------------------
// Verify Razorpay order amount
// ---------------------------------

const razorpayOrder =
  await razorpay.orders.fetch(razorpay_order_id);

if (!razorpayOrder) {
  return res.status(400).json({
    message: "Razorpay order not found",
  });
}

if (razorpayOrder.currency !== "INR") {
  return res.status(400).json({
    message: "Invalid payment currency",
  });
}

console.log(
  "Razorpay order amount:",
  razorpayOrder.amount
);

console.log(
  "Razorpay order currency:",
  razorpayOrder.currency
);

    // ---------------------------------
    // Prevent duplicate orders
    // ---------------------------------

    const existingOrder = await Order.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingOrder) {
      return res.status(200).json({
        message: "Payment already processed",
        order: existingOrder,
      });
    }

    // ---------------------------------
    // Validate menu items again
    // ---------------------------------

    const menuItemIds = items.map(
      (item) => item.menuItem
    );

    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      available: true,
    });

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        message:
          "One or more menu items are unavailable",
      });
    }

    const menuMap = new Map(
      menuItems.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    let calculatedTotal = 0;

    const validatedItems = items.map((item) => {
      const menuItem = menuMap.get(
        item.menuItem.toString()
      );

      if (!menuItem) {
        throw new Error("Invalid menu item");
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error(
          "Invalid item quantity"
        );
      }

      calculatedTotal +=
        menuItem.price * quantity;

      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      };
    });

    // ---------------------------------
// Compare Razorpay amount with actual
// TiffinGo menu total
// ---------------------------------

const expectedAmountInPaise =
  Math.round(calculatedTotal * 100);

if (razorpayOrder.amount !== expectedAmountInPaise) {
  console.error(
    "Payment amount mismatch:",
    {
      razorpayAmount: razorpayOrder.amount,
      expectedAmount: expectedAmountInPaise,
    }
  );

  return res.status(400).json({
    message:
      "Payment amount does not match the order total",
  });
}

console.log(
  "Razorpay amount verified successfully ✅"
);
    const now = new Date();

const deliveryDate = getNextLunchDeliveryDate();
const deliveryWindow = getDeliveryWindow();

    // ---------------------------------
    // Create paid TiffinGo order
    // ---------------------------------

    const order = await Order.create({
      user: req.user.userId,

      items: validatedItems,

      totalAmount: Number(
        calculatedTotal.toFixed(2)
      ),

      razorpayOrderId: razorpay_order_id,

      razorpayPaymentId: razorpay_payment_id,

      paymentStatus: "Paid",

      deliveryAddress: deliveryAddress || "",

      phone: phone || "",
      deliveryDate,
      deliveryWindow,

      status: "Placed",
    });

    console.log(
      "TiffinGo order created successfully:",
      order._id
    );

    return res.status(201).json({
      message:
        "Payment verified and order placed successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while verifying payment",
    });
  }
});
// =====================================
// CREATE COD ORDER
// POST /api/payments/create-cod-order
// =====================================

router.post("/create-cod-order", protect, async (req, res) => {
  console.log("COD ORDER ROUTE REACHED");

  try {
    const { items, deliveryAddress, phone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    // Get actual available menu items
    const menuItemIds = items.map((item) => item.menuItem);

    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      available: true,
    });

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        message: "One or more menu items are unavailable",
      });
    }

    const menuMap = new Map(
      menuItems.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    let calculatedTotal = 0;

    const validatedItems = items.map((item) => {
      const menuItem = menuMap.get(
        item.menuItem.toString()
      );

      if (!menuItem) {
        throw new Error("Invalid menu item");
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid item quantity");
      }

      calculatedTotal += menuItem.price * quantity;

      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      };
    });
     const now = new Date();

const deliveryDate = getNextLunchDeliveryDate();
const deliveryWindow = getDeliveryWindow();
    const order = await Order.create({
      user: req.user.userId,

      items: validatedItems,

      totalAmount: Number(
        calculatedTotal.toFixed(2)
      ),

      paymentMethod: "COD",
      paymentStatus: "Pending",

      deliveryAddress: deliveryAddress.trim(),
phone: phone || "",
deliveryDate,
deliveryWindow,

      status: "Placed",
    });

    console.log(
      "COD order created successfully:",
      order._id
    );

    return res.status(201).json({
      message: "Order placed successfully with Cash on Delivery",
      order,
    });

  } catch (error) {
    console.error(
      "Create COD order error:",
      error
    );

    return res.status(500).json({
      message: "Could not place COD order",
    });
  }
});
// =====================================
// VERIFY SUBSCRIPTION PAYMENT
// POST /api/payments/verify-subscription
// =====================================

router.post(
  "/verify-subscription",
  protect,
  async (req, res) => {
    console.log(
      "SUBSCRIPTION VERIFY ROUTE REACHED"
    );

    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
        mealsPerDay,
        deliveryAddress,
      } = req.body;

      // ---------------------------------
      // Basic validation
      // ---------------------------------

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          message:
            "Missing subscription payment details",
        });
      }

      if (!["Weekly", "Monthly"].includes(plan)) {
        return res.status(400).json({
          message: "Invalid subscription plan",
        });
      }

      // ---------------------------------
      // Verify Razorpay signature
      // ---------------------------------

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      if (
        generatedSignature !== razorpay_signature
      ) {
        console.error(
          "Invalid subscription payment signature"
        );

        return res.status(400).json({
          message:
            "Subscription payment verification failed",
        });
      }

      console.log(
        "Subscription Razorpay signature verified ✅"
      );

      // ---------------------------------
      // Fetch Razorpay order
      // ---------------------------------

      const razorpayOrder =
        await razorpay.orders.fetch(
          razorpay_order_id
        );

      if (!razorpayOrder) {
        return res.status(400).json({
          message: "Razorpay order not found",
        });
      }

      if (razorpayOrder.currency !== "INR") {
        return res.status(400).json({
          message: "Invalid payment currency",
        });
      }

      // ---------------------------------
      // Verify subscription amount
      // ---------------------------------

      const expectedPrices = {
        Weekly: 700,
        Monthly: 2500,
      };

      const expectedAmountInPaise =
        expectedPrices[plan] * 100;

      console.log(
        "Subscription Razorpay amount:",
        razorpayOrder.amount
      );

      console.log(
        "Expected subscription amount:",
        expectedAmountInPaise
      );

      if (
        razorpayOrder.amount !==
        expectedAmountInPaise
      ) {
        console.error(
          "Subscription payment amount mismatch:",
          {
            razorpayAmount:
              razorpayOrder.amount,
            expectedAmount:
              expectedAmountInPaise,
          }
        );

        return res.status(400).json({
          message:
            "Subscription payment amount does not match",
        });
      }

      console.log(
        "Subscription amount verified successfully ✅"
      );

      // ---------------------------------
      // Prevent duplicate subscription
      // ---------------------------------

      const existingPayment =
        await Subscription.findOne({
          razorpayPaymentId:
            razorpay_payment_id,
        });

      if (existingPayment) {
        return res.status(200).json({
          message:
            "Subscription payment already processed",
          subscription: existingPayment,
        });
      }

      // ---------------------------------
      // Prevent multiple active subscriptions
      // ---------------------------------

      const existingSubscription =
        await Subscription.findOne({
          user: req.user.userId,
          status: "Active",
        });

      if (existingSubscription) {
        return res.status(409).json({
          message:
            "You already have an active subscription",
          subscription: existingSubscription,
        });
      }

      // ---------------------------------
      // Calculate subscription dates
      // ---------------------------------

      const start = new Date();

      const end = new Date(start);

      if (plan === "Weekly") {
        end.setDate(end.getDate() + 7);
      } else {
        end.setMonth(end.getMonth() + 1);
      }

      // ---------------------------------
      // Create paid subscription
      // ---------------------------------

      const subscription =
        await Subscription.create({
          user: req.user.userId,

          plan,

          mealsPerDay:
            Number(mealsPerDay) || 1,

          price: expectedPrices[plan],

          startDate: start,

          endDate: end,

          deliveryAddress:
            deliveryAddress || "",

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          paymentStatus: "Paid",

          status: "Active",
        });

      console.log(
        "Subscription created successfully:",
        subscription._id
      );

      return res.status(201).json({
        message:
          "Subscription payment verified successfully",
        subscription,
      });
    } catch (error) {
      console.error(
        "Subscription payment verification error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while verifying subscription payment",
      });
    }
  }
);

module.exports = router;
