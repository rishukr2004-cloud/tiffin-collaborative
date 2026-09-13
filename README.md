# 🍱 Eat It — Full-Stack Food Ordering & Lunch Delivery Platform

**Eat It** is a full-stack food ordering and lunch delivery platform built for customers ordering meals from homes, hostels, PGs, and offices.

The platform provides a complete ordering experience with authentication, meal discovery, search and filtering, cart management, subscriptions, online payments, Cash on Delivery, favorites, ratings and reviews, order tracking, scheduled lunch delivery, and an administrative dashboard.

## 🌐 Live Application

**Frontend:**
https://tiffin-collaborative-live.vercel.app/

**Backend API:**
https://tiffin-collaborative.onrender.com

**GitHub Repository:**
https://github.com/rishukr2004-cloud/tiffin-collaborative

---

## ✨ Features

### 👤 Customer Features

* User registration and login
* JWT-based authentication
* Browse available meals
* Search meals by name
* Search meals by category
* Filter meals by category
* Filter meals by maximum price
* Clear search and filter selections
* Add meals to cart
* Update cart items
* Place food orders
* View order history
* Track order status
* Razorpay online payments
* Cash on Delivery
* Meal subscriptions
* Save meals to Favorites
* Manage favorite meals
* Rate meals from 1–5 stars
* Write meal reviews
* View reviews from other customers
* View average meal ratings

### 🔎 Search & Filtering

Customers can quickly discover meals using:

* Meal name search
* Category search
* Category filters
* Maximum price filtering
* Clear Filters

Search and filtering work together with the existing menu and cart workflow.

### ❤️ Favorites

Customers can save meals they like to a personal Favorites list.

Favorites are persisted for the authenticated user and remain available after refreshing the application.

### ⭐ Ratings & Reviews

Customers can:

* Rate meals from 1 to 5 stars
* Write meal reviews
* View reviews from other customers
* View average ratings
* See review authors

Each customer can submit one review per meal.

---

## 🍱 Scheduled Lunch Delivery

Eat It includes a backend-enforced lunch delivery scheduling system designed for hostel, PG, and office meal delivery.

### Delivery Window

**1:00 PM – 2:00 PM**

### Ordering Cutoff

* Orders placed **before 11:00 AM** are scheduled for the same day's lunch.
* Orders placed **at or after 11:00 AM** are scheduled for the next day's lunch.
* The delivery date is stored with the order.
* The delivery window is stored with the order.
* The cutoff rule is enforced by the backend rather than relying only on the frontend.

This makes the delivery schedule part of the actual order-processing logic.

---

## 🛒 Cart & Order Workflow

The application provides a complete food-ordering flow:

```text
Browse Meals
     ↓
Search / Filter
     ↓
Add to Cart
     ↓
Review Cart
     ↓
Checkout
     ↓
Choose Payment Method
     ↓
Place Order
     ↓
Delivery Scheduling
     ↓
Order Tracking
```

---

## 💳 Payment System

Eat It supports two payment methods.

### Razorpay

Customers can complete online payments through the Razorpay payment integration.

### Cash on Delivery

Customers can choose Cash on Delivery.

COD orders are created with a pending payment status until payment is collected.

---

## 📦 Meal Subscriptions

The application supports meal subscriptions in addition to individual food orders.

Customers can access subscription functionality through the existing customer workflow while continuing to use normal food ordering.

---

## 🛠️ Admin Dashboard

Eat It includes a separate admin workflow with:

* Admin authentication
* Role-based access
* Admin dashboard
* Menu management
* Order management
* Customer/order monitoring
* Order status management
* Administrative controls

Customer and admin functionality are protected using authentication and role-based authorization.

---

## 🔐 Authentication & Security

The backend implements:

* JWT-based authentication
* Protected API routes
* Role-based authorization
* Password hashing with bcrypt
* Customer/admin access control
* Environment-based configuration for sensitive credentials

Secret environment files are excluded from version control.

---

## 🏗️ System Architecture

```text
┌──────────────────────────┐
│        Customers         │
│    Web / Mobile Browser  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     React + Vite         │
│        Frontend          │
└────────────┬─────────────┘
             │
             │ REST API
             ▼
┌──────────────────────────┐
│    Node.js + Express     │
│        Backend           │
└───────┬──────────┬───────┘
        │          │
        ▼          ▼
┌─────────────┐  ┌─────────────┐
│  MongoDB    │  │  Razorpay   │
│    Atlas    │  │   Payments  │
└─────────────┘  └─────────────┘
```

---

## 🧑‍💻 Technology Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB
* Mongoose
* MongoDB Atlas

### Authentication

* JSON Web Tokens (JWT)
* bcrypt

### Payments

* Razorpay
* Cash on Delivery

### Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database

### Collaboration & Version Control

* Git
* GitHub

---

## 📂 Project Structure

```text
tiffin-collaborative/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB Atlas account
* Git

### 1. Clone the repository

```bash
git clone https://github.com/rishukr2004-cloud/tiffin-collaborative.git
cd tiffin-collaborative
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Configure the frontend

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Start the frontend

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

### 5. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 6. Configure the backend

Create:

```text
server/.env
```

Configure the required environment variables for:

* MongoDB connection
* JWT secret
* Razorpay credentials

Never commit backend secrets or `.env` files to GitHub.

### 7. Start the backend

```bash
npm start
```

The backend runs locally on:

```text
http://localhost:5000
```

---

## 🚀 Production Deployment

### Frontend — Vercel

The React/Vite frontend is deployed on Vercel.

**Live URL:**

https://tiffin-collaborative-live.vercel.app/

The production frontend uses:

```env
VITE_API_URL=https://tiffin-collaborative.onrender.com
```

### Backend — Render

The Node.js/Express backend is deployed on Render.

**Backend URL:**

https://tiffin-collaborative.onrender.com

### Database — MongoDB Atlas

MongoDB Atlas provides the production database used by the backend.

---

## 👥 Collaboration

This project was developed collaboratively using Git and GitHub.

GitHub commit history is used to track individual contributions and project development.

### Contributors

**Rishu**

* Full-stack development
* Frontend and backend implementation
* Authentication and authorization
* Database integration
* Payment integration
* Search and filtering
* Favorites
* Ratings and reviews
* Lunch delivery scheduling
* Admin functionality
* Deployment and project integration

**Ayesha Nazmun Nahar**

* Frontend feature contributions
* Review form improvements
* Search/filter UI improvements
* Clear Filters functionality
* Collaborative GitHub development

---

## 📌 Project Highlights

* Full-stack React + Node.js application
* REST API architecture
* MongoDB database integration
* JWT authentication
* Role-based customer/admin authorization
* Persistent Favorites system
* Search and filtering functionality
* Ratings and reviews
* Razorpay payment integration
* Cash on Delivery
* Meal subscriptions
* Backend-enforced lunch delivery cutoff
* Scheduled 1:00 PM–2:00 PM lunch delivery
* Responsive food-ordering interface
* Production deployment using Vercel and Render
* Collaborative GitHub development

---

## 🔮 Future Improvements

Potential future enhancements include:

* Hostel, PG, and office bulk ordering
* Multiple delivery locations
* Delivery partner management
* Real-time delivery tracking
* Push notifications
* Email/SMS order notifications
* Coupon and discount system
* Advanced admin analytics
* Automated subscription renewal
* Customer notification system

---

## 📄 License

This project was developed as a collaborative software project for learning, portfolio, and resume purposes.
