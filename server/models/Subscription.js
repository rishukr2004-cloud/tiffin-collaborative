const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: String,
      enum: ["Weekly", "Monthly"],
      required: true,
    },

    mealsPerDay: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    razorpayOrderId: {
  type: String,
  default: "",
},

razorpayPaymentId: {
  type: String,
  default: "",
},

paymentStatus: {
  type: String,
  enum: ["Pending", "Paid", "Failed"],
  default: "Pending",
},

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    deliveryAddress: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);