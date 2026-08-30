const express = require("express");
const MenuItem = require("../models/MenuItem");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// GET ALL AVAILABLE MENU ITEMS
// GET /api/menu
// =====================================

router.get("/", protect, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      available: true,
    }).sort({ createdAt: -1 });

    res.json({
      menuItems,
    });
  } catch (error) {
    console.error("Get menu error:", error);

    res.status(500).json({
      message: "Server error while getting menu",
    });
  }
});

// =====================================
// ADMIN: GET ALL MENU ITEMS
// GET /api/menu/admin/all
// =====================================
// Includes both available and unavailable items.

router.get(
  "/admin/all",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const menuItems = await MenuItem.find({})
        .sort({ createdAt: -1 });

      res.json({
        menuItems,
      });
    } catch (error) {
      console.error(
        "Admin get menu error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while getting all menu items",
      });
    }
  }
);

// =====================================
// GET SINGLE MENU ITEM
// GET /api/menu/:id
// =====================================

router.get("/:id", protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(
      req.params.id
    );

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    res.json({
      menuItem,
    });
  } catch (error) {
    console.error(
      "Get menu item error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while getting menu item",
    });
  }
});

// =====================================
// ADMIN: CREATE MENU ITEM
// POST /api/menu
// =====================================

router.post(
  "/",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        image,
        available,
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !description ||
        price === undefined ||
        price === null ||
        !category
      ) {
        return res.status(400).json({
          message:
            "Name, description, price and category are required",
        });
      }

      const menuItem = await MenuItem.create({
        name,
        description,
        price,
        category,
        image: image || "",
        available:
          available !== undefined
            ? available
            : true,
      });

      res.status(201).json({
        message:
          "Menu item created successfully",
        menuItem,
      });
    } catch (error) {
      console.error(
        "Create menu item error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while creating menu item",
      });
    }
  }
);

// =====================================
// ADMIN: UPDATE MENU ITEM
// PATCH /api/menu/:id
// =====================================

router.patch(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        image,
        available,
      } = req.body;

      const menuItem =
        await MenuItem.findById(req.params.id);

      if (!menuItem) {
        return res.status(404).json({
          message: "Menu item not found",
        });
      }

      // Update only fields that were provided
      if (name !== undefined) {
        menuItem.name = name;
      }

      if (description !== undefined) {
        menuItem.description = description;
      }

      if (price !== undefined) {
        menuItem.price = price;
      }

      if (category !== undefined) {
        menuItem.category = category;
      }

      if (image !== undefined) {
        menuItem.image = image;
      }

      if (available !== undefined) {
        menuItem.available = available;
      }

      await menuItem.save();

      res.json({
        message:
          "Menu item updated successfully",
        menuItem,
      });
    } catch (error) {
      console.error(
        "Update menu item error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while updating menu item",
      });
    }
  }
);

// =====================================
// ADMIN: DELETE MENU ITEM
// DELETE /api/menu/:id
// =====================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const menuItem =
        await MenuItem.findById(req.params.id);

      if (!menuItem) {
        return res.status(404).json({
          message: "Menu item not found",
        });
      }

      await MenuItem.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Menu item deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete menu item error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while deleting menu item",
      });
    }
  }
);

module.exports = router;