const express = require("express");
const router = express.Router();
const User = require("../models/user");
const MenuItem = require("../models/MenuItem");
const { protect } = require("../middleware/authMiddleware");

// Get user's favorites
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("favorites");

    res.json(user.favorites || []);
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Failed to load favorites" });
  }
});

// Add a meal to favorites
router.post("/:menuItemId", protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.menuItemId);

    if (!menuItem) {
      return res.status(404).json({ message: "Meal not found" });
    }

    const user = await User.findById(req.user.userId);

    if (!user.favorites.includes(menuItem._id)) {
      user.favorites.push(menuItem._id);
      await user.save();
    }

    res.json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// Remove a meal from favorites
router.delete("/:menuItemId",protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.menuItemId
    );

    await user.save();

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

module.exports = router;