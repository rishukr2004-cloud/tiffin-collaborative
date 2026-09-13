# 🍱 Eat It — Food Ordering & Lunch Delivery Platform

A full-stack food ordering web application built for customers, hostel/PG residents, and office users.

Eat It allows customers to browse meals, search and filter the menu, save favorites, place orders, make payments, subscribe to meal plans, and leave ratings and reviews.

The platform also includes an admin dashboard for managing the food ordering system.

## 🚀 Live Demo

Frontend: https://tiffin-collaborative-live.vercel.app

Backend API: https://tiffin-collaborative.onrender.com

## ✨ Features

### 👤 Customer Features

- User registration and login
- Browse available meals
- Search meals by name or category
- Filter meals by category
- Filter meals by maximum price
- Clear search and filter selections
- Add meals to cart
- Place food orders
- Track order status
- Razorpay online payments
- Cash on Delivery
- Meal subscriptions
- Save meals to Favorites
- View and manage favorite meals
- Rate meals from 1–5 stars
- Write meal reviews
- View ratings and reviews from other customers
- Lunch delivery scheduling

### 🍱 Lunch Delivery

The platform supports scheduled lunch delivery:

- Delivery window: **1:00 PM – 2:00 PM**
- Orders placed before **11:00 AM** are scheduled for the same day's lunch
- Orders placed at or after **11:00 AM** are scheduled for the next day's lunch
- Delivery scheduling is enforced by the backend

### 🛠️ Admin Features

- Admin authentication
- Admin dashboard
- Menu management
- Order management
- Customer/order monitoring
- Order status management
- Administrative access controls

## 🧑‍💻 Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

### Payments

- Razorpay
- Cash on Delivery

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

## 📂 Project Structure

```text
tiffin-collaborative/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
