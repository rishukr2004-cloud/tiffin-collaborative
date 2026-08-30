const express = require("express");

const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// CREATE ORDER
// POST /api/orders
// =====================================

  // =====================================
// GET ALL ORDERS — ADMIN ONLY
// GET /api/orders/admin/all
// =====================================

router.get(
  "/admin/all",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate(
          "user",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

      return res.json({
        orders,
      });
    } catch (error) {
      console.error(
        "Get all orders error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while getting all orders",
      });
    }
  }
);
// =====================================
// GET MY ORDERS
// GET /api/orders
// =====================================

router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Server error while getting orders",
    });
  }
});

// =====================================
// GET SINGLE ORDER
// GET /api/orders/:id
// =====================================



router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Server error while getting order",
    });
  }
});
// =====================================
// CANCEL MY ORDER
// PATCH /api/orders/:id/cancel
// =====================================

router.patch(
  "/:id/cancel",
  protect,
  async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user.userId,
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Only allow cancellation while order is Placed
      if (order.status !== "Placed") {
        return res.status(400).json({
          message:
            "Order cannot be cancelled after preparation has started",
        });
      }

      order.status = "Cancelled";

      await order.save();

      return res.json({
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while cancelling order",
      });
    }
  }
);

// =====================================
// UPDATE ORDER STATUS — ADMIN ONLY
// PATCH /api/orders/:id/status
// =====================================

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "Placed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      order.status = status;

      await order.save();

      return res.json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while updating order status",
      });
    }
  }
);
module.exports = router;