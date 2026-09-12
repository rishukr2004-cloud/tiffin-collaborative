const express = require("express");
const router = express.Router();

const Review = require("../models/review");
const MenuItem = require("../models/MenuItem");
const { protect } = require("../middleware/authMiddleware");

// Get reviews for a meal
router.get("/:menuItemId", async (req, res) => {
  try {
    const reviews = await Review.find({
      menuItem: req.params.menuItemId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
});

// Add a review
router.post("/:menuItemId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const menuItem = await MenuItem.findById(req.params.menuItemId);

    if (!menuItem) {
      return res.status(404).json({ message: "Meal not found" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const existingReview = await Review.findOne({
      user: req.user.userId,
      menuItem: req.params.menuItemId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this meal",
      });
    }

    const review = await Review.create({
      user: req.user.userId,
      menuItem: req.params.menuItemId,
      rating,
      comment,
    });

    const populatedReview = await review.populate("user", "name");

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
});

module.exports = router;