"use client";

import { useState } from "react";
import {
  Clock3,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Check,
  Plus,
  Minus,
  X,
  Star,
} from "lucide-react";

type Food = {
  id: number;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: "Lunch" | "Dinner";
};

const foods: Food[] = [
  {
    id: 1,
    name: "Home Style Veg Thali",
    description: "Dal, rice, seasonal sabzi, roti & salad",
    price: 79,
    emoji: "🍱",
    category: "Lunch",
  },
  {
    id: 2,
    name: "Chicken Thali",
    description: "Chicken curry, rice, dal, roti & salad",
    price: 109,
    emoji: "🍗",
    category: "Lunch",
  },
  {
    id: 3,
    name: "Paneer Special",
    description: "Paneer curry, rice, dal, roti & salad",
    price: 99,
    emoji: "🥘",
    category: "Lunch",
  },
  {
    id: 4,
    name: "Student Dinner",
    description: "Rice, dal, sabzi, roti & today's special",
    price: 79,
    emoji: "🍛",
    category: "Dinner",
  },
  {
    id: 5,
    name: "Chicken Dinner",
    description: "Chicken curry, rice, dal, roti & salad",
    price: 109,
    emoji: "🍗",
    category: "Dinner",
  },
  {
    id: 6,
    name: "Paneer Dinner",
    description: "Paneer curry, rice, dal, roti & salad",
    price: 99,
    emoji: "🥘",
    category: "Dinner",
  },
];

export default function Home() {
  const [category, setCategory] = useState<"Lunch" | "Dinner">("Lunch");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const visibleFoods = foods.filter(
    (food) => food.category === category
  );

  const addToCart = (id: number) => {
    setCart((current) => ({
      ...current,
      [id]: (current[id] || 0) + 1,
    }));
  };

  const removeFromCart = (id: number) => {
    setCart((current) => {
      const updated = { ...current };

      if (!updated[id]) return updated;

      updated[id] -= 1;

      if (updated[id] <= 0) {
        delete updated[id];
      }

      return updated;
    });
  };

  const cartItems = foods.filter((food) => cart[food.id]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, food) => total + food.price * cart[food.id],
    0
  );

  return (
    <main>
      {/* NAVBAR */}

      <header className="navbar">
        <a href="#" className="logo">
          Tiffin<span>Go</span>
        </a>

        <nav>
          <a href="#menu">Menu</a>
          <a href="#how">How it works</a>
          <a href="#plans">Subscriptions</a>
          <a href="#reviews">Reviews</a>
        </nav>

        <button
          className="cart-button"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag size={18} />
          Cart
          {cartCount > 0 && <span>{cartCount}</span>}
        </button>
      </header>

      {/* HERO */}

      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            🍱 Made for students in Kolkata
          </div>

          <h1>
            Ghar jaisa khana.
            <br />
            <span>PG tak, on time.</span>
          </h1>

          <p>
            Affordable home-style meals delivered in bulk to your PG.
            Choose your lunch or dinner before the cutoff and we'll
            handle the rest.
          </p>

          <div className="hero-buttons">
            <a href="#menu" className="primary-btn">
              Order today's meal
              <ArrowRight size={18} />
            </a>

            <a href="#plans" className="secondary-btn">
              View subscriptions
            </a>
          </div>

          <div className="delivery-info">
            <div>
              <Clock3 size={20} />
              <strong>Lunch</strong>
              <small>1:00 – 2:00 PM</small>
            </div>

            <div>
              <Clock3 size={20} />
              <strong>Dinner</strong>
              <small>8:00 – 9:00 PM</small>
            </div>

            <div>
              <MapPin size={20} />
              <strong>PG Delivery</strong>
              <small>Bulk & on-time</small>
            </div>
          </div>
        </div>

        <div className="hero-food">
          <div className="food-orbit orbit-one" />
          <div className="food-orbit orbit-two" />

          <div className="floating-food food-one">
            🍛
          </div>

          <div className="floating-food food-two">
            🍗
          </div>

          <div className="hero-plate">
            🍱
          </div>

          <div className="floating-card">
            <Check size={16} />
            <div>
              <strong>Freshly prepared</strong>
              <small>Delivered to your PG</small>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section id="how" className="section">
        <div className="section-heading center">
          <span className="eyebrow">SIMPLE PROCESS</span>
          <h2>Food without the food-delivery chaos.</h2>
          <p>
            We take multiple student orders together and deliver them
            in one efficient batch.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div>01</div>
            <h3>Choose your meal</h3>
            <p>
              Pick lunch or dinner from today's student-friendly menu.
            </p>
          </div>

          <div className="step">
            <div>02</div>
            <h3>Order before cutoff</h3>
            <p>
              Lunch orders close at 11 AM. Dinner orders close at 5 PM.
            </p>
          </div>

          <div className="step">
            <div>03</div>
            <h3>We prepare in bulk</h3>
            <p>
              Your orders are prepared together with our local food
              partner.
            </p>
          </div>

          <div className="step">
            <div>04</div>
            <h3>Delivered to your PG</h3>
            <p>
              One organized delivery window means faster and easier
              delivery.
            </p>
          </div>
        </div>
      </section>

      {/* MENU */}

      <section id="menu" className="section menu-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TODAY'S MENU</span>
            <h2>Choose your meal</h2>
          </div>

          <div className="cutoff">
            ⏰ Order before the cutoff
          </div>
        </div>

        <div className="menu-tabs">
          <button
            className={category === "Lunch" ? "active" : ""}
            onClick={() => setCategory("Lunch")}
          >
            Lunch · 1–2 PM
          </button>

          <button
            className={category === "Dinner" ? "active" : ""}
            onClick={() => setCategory("Dinner")}
          >
            Dinner · 8–9 PM
          </button>
        </div>

        <div className="menu-grid">
          {visibleFoods.map((food) => (
            <article className="food-card" key={food.id}>
              <div className="food-image">
                <span>{food.emoji}</span>
              </div>

              <div className="food-info">
                <h3>{food.name}</h3>

                <p>{food.description}</p>

                <div className="food-bottom">
                  <strong className="food-price">
                    ₹{food.price}
                  </strong>

                  <button
                    className="add-btn"
                    onClick={() => addToCart(food.id)}
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SUBSCRIPTIONS */}

      <section id="plans" className="section plans">
        <div className="section-heading center">
          <span className="eyebrow">SAVE MORE</span>
          <h2>Student subscriptions</h2>
          <p>
            Stop ordering every day. Pick a plan and make meals
            automatic.
          </p>
        </div>

        <div className="plan-grid">
          <div className="plan">
            <span>Lunch</span>

            <div className="price">
              ₹1,999 <small>/ month</small>
            </div>

            <p>
              One lunch every day with flexible skip options.
            </p>

            <button>Choose Lunch Plan</button>
          </div>

          <div className="plan popular">
            <div className="popular-label">
              MOST POPULAR
            </div>

            <span>Lunch + Dinner</span>

            <div className="price">
              ₹3,699 <small>/ month</small>
            </div>

            <p>
              Two home-style meals every day at a student-friendly
              price.
            </p>

            <button>Choose Full Plan</button>
          </div>

          <div className="plan">
            <span>Dinner</span>

            <div className="price">
              ₹1,999 <small>/ month</small>
            </div>

            <p>
              A reliable dinner delivered to your PG every evening.
            </p>

            <button>Choose Dinner Plan</button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}

      <section id="reviews" className="section reviews">
        <div className="section-heading center">
          <span className="eyebrow">STUDENT REVIEWS</span>
          <h2>Loved by hungry students.</h2>
        </div>

        <div className="review-grid">
          {[
            {
              name: "Arjun",
              text: "Much easier than ordering food every night. The delivery timing is actually useful for PG life.",
            },
            {
              name: "Priya",
              text: "Affordable, filling and feels much closer to proper ghar ka khana.",
            },
            {
              name: "Rahul",
              text: "The subscription idea is great for students. I don't have to think about dinner anymore.",
            },
          ].map((review) => (
            <div className="review" key={review.name}>
              <div className="stars">
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
              </div>

              <p>"{review.text}"</p>

              <strong>{review.name}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}

      <footer>
        <div className="logo">
          Tiffin<span>Go</span>
        </div>

        <p>
          Affordable meals for students. Delivered to your PG.
        </p>
      </footer>

      {/* CART */}

      {cartOpen && (
        <div
          className="overlay"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="cart-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setCartOpen(false)}
            >
              <X size={20} />
            </button>

            <h2>Your cart</h2>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={40} />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                {cartItems.map((food) => (
                  <div className="cart-item" key={food.id}>
                    <div>
                      <strong>{food.name}</strong>
                      <small>
                        ₹{food.price} × {cart[food.id]}
                      </small>
                    </div>

                    <div className="quantity">
                      <button
                        onClick={() =>
                          removeFromCart(food.id)
                        }
                      >
                        <Minus size={14} />
                      </button>

                      <span>{cart[food.id]}</span>

                      <button
                        onClick={() =>
                          addToCart(food.id)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="cart-total">
                  <span>Total</span>
                  <strong>₹{cartTotal}</strong>
                </div>

                <button className="checkout-btn">
                  Continue to checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}