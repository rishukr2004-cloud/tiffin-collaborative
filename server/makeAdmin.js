const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const User = require("./models/user");

const email = "rishukrhfc2004@gmail.com";

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      console.log("User not found:", email);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.role = "admin";

    await user.save();

    console.log("Admin account updated successfully");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Make admin failed:");
    console.error(error.message);

    await mongoose.disconnect();
    process.exit(1);
  }
}

makeAdmin();