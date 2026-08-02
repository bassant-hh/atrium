import { useState } from "react";
import "./newPage.css";
import { NavLink } from "react-router-dom";

const CATEGORIES = [
  { key: "food", label: "Food", icon: "🍕" },
  { key: "printing", label: "Printing", icon: "🖨️" },
  { key: "stationery", label: "Stationery", icon: "✏️" },
  { key: "books", label: "Books", icon: "📚" },
];

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash on Delivery", desc: "Pay when you receive" },
  { key: "card", label: "Credit/Debit Card", desc: "Pay online now" },
  { key: "wallet", label: "Digital Wallet", desc: "Apple Pay, Mada, STC Pay" },
];

const DELIVERY_FEE = 5;

const NewOrder = () => {
  const [category, setCategory] = useState("food");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(25);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const total = price * quantity + DELIVERY_FEE;

  return (
    <div className="new-order">
      <h1 className="new-order__title">New Order</h1>

      <div className="new-order__layout">
        <div className="new-order__left">
          {/* Category */}
          <section className="no-card">
            <h2 className="no-card__title">Select Category</h2>

            <div className="no-category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`no-category-btn ${
                    category === cat.key ? "no-category-btn--active" : ""
                  }`}
                  onClick={() => setCategory(cat.key)}
                >
                  <span className="no-category-btn__icon">{cat.icon}</span>
                  <span className="no-category-btn__label">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Item Details */}
          <section className="no-card">
            <h2 className="no-card__title">Item Details</h2>

            <div className="no-field">
              <label className="no-field__label">Item Name</label>
              <input
                className="no-field__input"
                placeholder="e.g., Chicken Shawarma"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div className="no-field">
              <label className="no-field__label">Description</label>
              <textarea
                className="no-field__textarea"
                placeholder="Add any special instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="no-locations">
              <div className="no-field">
                <label className="no-field__label">Pickup Location</label>
                <div className="no-field__icon-input">
                  <span>
                    <i class="fa-solid fa-location-dot"></i>
                  </span>
                  <input
                    placeholder="Building A, Room 101"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="no-field">
                <label className="no-field__label">Delivery Location</label>
                <div className="no-field__icon-input">
                  <span>
                    <i class="fa-solid fa-location-dot"></i>
                  </span>
                  <input
                    placeholder="Building C, Room 205"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="no-field">
              <label className="no-field__label">Quantity</label>

              <div className="no-quantity">
                <button
                  className="no-quantity__btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>

                <span className="no-quantity__value">{quantity}</span>

                <button
                  className="no-quantity__btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="no-field">
              <label className="no-field__label">Item Price (per unit)</label>

              <div className="no-field__price-input">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
                <span>SAR</span>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="no-card">
            <h2 className="no-card__title">Payment Method</h2>

            <div className="no-payment-list">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.key}
                  className={`no-payment-item ${
                    paymentMethod === pm.key ? "no-payment-item--active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.key}
                    checked={paymentMethod === pm.key}
                    onChange={() => setPaymentMethod(pm.key)}
                    className="no-payment-item__radio"
                  />

                  <div>
                    <p className="no-payment-item__label">{pm.label}</p>
                    <p className="no-payment-item__desc">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDE */}
        <aside className="no-summary">
          <h2 className="no-summary__title">Order Summary</h2>

          <div className="no-summary__rows">
            <div className="no-summary__row">
              <span>Item Price ({quantity}x)</span>
              <span>{price * quantity} SAR</span>
            </div>

            <div className="no-summary__row">
              <span>Delivery Fee</span>
              <span>{DELIVERY_FEE} SAR</span>
            </div>
          </div>

          <div className="no-summary__total">
            <span>Total</span>
            <span className="no-summary__total-value">{total} SAR</span>
          </div>

          <div className="no-summary__meta">
            <p>
              <i class="fa-regular fa-clock"></i> Estimated Time: 15–30 mins
            </p>
            <p>
              <i class="fa-solid fa-location-dot"></i> Campus Delivery Only
            </p>
          </div>
          <NavLink to="/my-orders">
            <button className="no-summary__place-btn">Place Order</button>
          </NavLink>

          <p className="no-summary__terms">
            By placing this order, you agree to our Terms & Conditions
          </p>
        </aside>
      </div>
    </div>
  );
};

export default NewOrder;
