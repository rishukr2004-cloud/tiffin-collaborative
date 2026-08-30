const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const MenuItem = require("./models/MenuItem");

const menuItems = [
  {
    name: "North Indian Thali",
    description: "Dal, rice, roti, sabzi, salad and sweet",
    price: 120,
    category: "Thali",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    available: true,
  },
  {
    name: "Paneer Tiffin",
    description: "Paneer curry, 2 rotis, rice and salad",
    price: 100,
    category: "Tiffin",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    available: true,
  },
  {
    name: "Veg Biryani",
    description: "Fragrant vegetable biryani with raita",
    price: 90,
    category: "Rice",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
    available: true,
  },
  {
    name: "Dal Rice Combo",
    description: "Dal, steamed rice, sabzi and pickle",
    price: 80,
    category: "Combo",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    available: true,
  },
];

async function seedMenu() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await MenuItem.deleteMany({});

    await MenuItem.insertMany(menuItems);

    console.log("Menu items created successfully");
    console.log(`Created ${menuItems.length} menu items`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Menu seed failed:");
    console.error(error.message);

    await mongoose.disconnect();
    process.exit(1);
  }
}

seedMenu();