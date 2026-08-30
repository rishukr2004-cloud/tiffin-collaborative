const express = require("express");

const Subscription = require("../models/Subscription");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");
const router = express.Router();

// =====================================
// CREATE SUBSCRIPTION
// POST /api/subscriptions
// =====================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      plan,
      mealsPerDay,
      price,
      startDate,
      deliveryAddress,
    } = req.body;

    if (!plan || !price || !startDate) {
      return res.status(400).json({
        message: "Plan, price and start date are required",
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

    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        message: "Invalid start date",
      });
    }

    const end = new Date(start);

    if (plan === "Weekly") {
      end.setDate(end.getDate() + 7);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      user: req.user.userId,
      plan,
      mealsPerDay: mealsPerDay || 1,
      price,
      startDate: start,
      endDate: end,
      deliveryAddress: deliveryAddress || "",
      status: "Active",
    });

    return res.status(201).json({
      message: "Subscription activated successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "Create subscription error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating subscription",
    });
  }
});

// =====================================
// GET MY SUBSCRIPTION
// GET /api/subscriptions
// =====================================

router.get("/", protect, async (req, res) => {
  try {
    const subscription =
      await Subscription.findOne({
        user: req.user.userId,
        status: "Active",
      }).sort({
        createdAt: -1,
      });

    if (
      subscription &&
      new Date() > new Date(subscription.endDate)
    ) {
      subscription.status = "Expired";

      await subscription.save();

      return res.json({
        subscription: null,
      });
    }

    return res.json({
      subscription: subscription || null,
    });
  } catch (error) {
    console.error(
      "Get subscription error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while getting subscription",
    });
  }
});

// =====================================
// CANCEL SUBSCRIPTION
// PATCH /api/subscriptions/cancel
// =====================================

router.patch(
  "/cancel",
  protect,
  async (req, res) => {
    try {
      const subscription =
        await Subscription.findOne({
          user: req.user.userId,
          status: "Active",
        });

      if (!subscription) {
        return res.status(404).json({
          message: "No active subscription found",
        });
      }

      subscription.status = "Cancelled";

      await subscription.save();

      return res.json({
        message: "Subscription cancelled",
        subscription,
      });
    } catch (error) {
      console.error(
        "Cancel subscription error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while cancelling subscription",
      });
    }
  }
);
// =====================================
// GET ALL SUBSCRIPTIONS — ADMIN ONLY
// GET /api/subscriptions/admin/all
// =====================================

router.get(
  "/admin/all",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const subscriptions = await Subscription.find()
  .populate(
    "user",
    "name email phone"
  )
  .sort({
    createdAt: -1,
  });

const now = new Date();

for (const subscription of subscriptions) {
  if (
    subscription.status === "Active" &&
    now > new Date(subscription.endDate)
  ) {
    subscription.status = "Expired";
    await subscription.save();
  }
}

      return res.json({
        subscriptions,
      });
    } catch (error) {
      console.error(
        "Get all subscriptions error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while getting all subscriptions",
      });
    }
  }
);

// =====================================
// GET MY SUBSCRIPTION HISTORY
// GET /api/subscriptions/history
// =====================================

router.get(
  "/history",
  protect,
  async (req, res) => {
    try {
      const subscriptions =
        await Subscription.find({
          user: req.user.userId,
        }).sort({
          createdAt: -1,
        });

      return res.json({
        subscriptions,
      });
    } catch (error) {
      console.error(
        "Get subscription history error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while getting subscription history",
      });
    }
  }
);

// =====================================
// ADMIN CANCEL SUBSCRIPTION
// PATCH /api/subscriptions/:id/cancel
// =====================================

router.patch(
  "/:id/cancel",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const subscription =
        await Subscription.findById(req.params.id);

      if (!subscription) {
        return res.status(404).json({
          message: "Subscription not found",
        });
      }

      if (subscription.status !== "Active") {
        return res.status(400).json({
          message:
            "Only active subscriptions can be cancelled",
        });
      }

      subscription.status = "Cancelled";

      await subscription.save();

      return res.json({
        message:
          "Subscription cancelled successfully",
        subscription,
      });
    } catch (error) {
      console.error(
        "Admin cancel subscription error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while cancelling subscription",
      });
    }
  }
);
module.exports = router;