const express = require("express");
const Order = require("../models/Order");
const Subscription = require("../models/Subscription");
const MenuItem = require("../models/MenuItem");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// GET ADMIN DASHBOARD STATISTICS
// GET /api/admin/stats
// =====================================

router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    // -------------------------------------
    // TOTAL ORDERS
    // -------------------------------------

    const totalOrders = await Order.countDocuments();

    // -------------------------------------
// CANCELLED ORDERS
// -------------------------------------

const cancelledOrders =
  await Order.countDocuments({
    status: "Cancelled",
  });
  // -------------------------------------
// PENDING PAYMENTS
// -------------------------------------

const pendingPayments =
  await Order.countDocuments({
    paymentStatus: "Pending",
  });

  // -------------------------------------
// ORDER STATUS COUNTS
// -------------------------------------

const placedOrders =
  await Order.countDocuments({
    status: "Placed",
  });

const preparingOrders =
  await Order.countDocuments({
    status: "Preparing",
  });

const outForDeliveryOrders =
  await Order.countDocuments({
    status: "Out for Delivery",
  });

const deliveredOrders =
  await Order.countDocuments({
    status: "Delivered",
  });

    // -------------------------------------
    // TODAY'S ORDERS
    // -------------------------------------

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });
    // -------------------------------------
// TODAY'S REVENUE
// -------------------------------------

const todayRevenueResult = await Order.aggregate([
  {
    $match: {
      paymentStatus: "Paid",
      status: {
        $ne: "Cancelled",
      },
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    },
  },
  {
    $group: {
      _id: null,
      todayRevenue: {
        $sum: "$totalAmount",
      },
    },
  },
]);

const todayRevenue =
  todayRevenueResult.length > 0
    ? todayRevenueResult[0].todayRevenue
    : 0;

    // -------------------------------------
    // TOTAL REVENUE
    // -------------------------------------

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          status: {
            $ne: "Cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

        // -------------------------------------
// PENDING PAYMENT AMOUNT
// -------------------------------------

const pendingPaymentResult = await Order.aggregate([
  {
    $match: {
      paymentStatus: "Pending",
      status: {
        $ne: "Cancelled",
      },
    },
  },
  {
    $group: {
      _id: null,
      pendingPaymentAmount: {
        $sum: "$totalAmount",
      },
    },
  },
]);

const pendingPaymentAmount =
  pendingPaymentResult.length > 0
    ? pendingPaymentResult[0].pendingPaymentAmount
    : 0;

    // -------------------------------------
    // ACTIVE SUBSCRIPTIONS
    // -------------------------------------

    const activeSubscriptions =
      await Subscription.countDocuments({
        status: "Active",
      });

    // -------------------------------------
    // TOTAL MENU ITEMS
    // -------------------------------------

    const totalMenuItems =
      await MenuItem.countDocuments();

    // -------------------------------------
    // SEND RESPONSE
    // -------------------------------------

    res.json({
   stats: {
  totalOrders,
  cancelledOrders,
  pendingPayments,
  pendingPaymentAmount,
  placedOrders,
  preparingOrders,
  outForDeliveryOrders,
  deliveredOrders,
  todayOrders,
  todayRevenue,
  totalRevenue,
  activeSubscriptions,
  totalMenuItems,
},
    });
  } catch (error) {
    console.error(
      "Admin dashboard stats error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while getting admin dashboard stats",
    });
  }
});

module.exports = router;