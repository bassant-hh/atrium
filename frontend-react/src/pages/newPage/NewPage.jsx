import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaUtensils,
  FaPrint,
  FaPencilAlt,
  FaBook,
  FaGraduationCap,
  FaHome,
  FaBuilding,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
  FaMapMarkerAlt,
  FaFlagCheckered,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
} from 'react-icons/fa';
import { createOrder } from '../../services/order.service';
import LocationPickerMap from '../../components/map/LocationPickerMap';
import './newPage.css';

const CATEGORIES = [
  {
    key: 'food',
    label: 'Food',
    desc: 'Meals, drinks & campus snacks',
    icon: FaUtensils,
    bg: '#FFF5F0',
    color: '#E05252',
  },
  {
    key: 'printing',
    label: 'Printing',
    desc: 'Documents, papers & handouts',
    icon: FaPrint,
    bg: '#F4FBFD',
    color: '#156B82',
  },
  {
    key: 'stationery',
    label: 'Stationery',
    desc: 'Pens, notebooks & supplies',
    icon: FaPencilAlt,
    bg: '#E8EFFD',
    color: '#5B8DEF',
  },
  {
    key: 'books',
    label: 'Books',
    desc: 'Textbooks & study materials',
    icon: FaBook,
    bg: '#E6F7F0',
    color: '#2E9E6B',
  },
];

const LOCATION_TYPES = [
  { key: 'campus', label: 'Campus', icon: FaGraduationCap },
  { key: 'home', label: 'Home', icon: FaHome },
  { key: 'office', label: 'Office', icon: FaBuilding },
];

const SAVED_ADDRESS_PRESETS = [
  {
    label: '🎓 Campus Main Gate',
    type: 'campus',
    fields: {
      university: 'South Valley University',
      faculty: 'Faculty of Commerce',
      deliveryPoint: 'Main Gate',
    },
    coords: { latitude: 26.1551, longitude: 32.716 },
  },
  {
    label: '🏠 Home - Univ. Street',
    type: 'home',
    fields: {
      street: 'University Street',
      building: '12',
      floor: '3',
      apartment: '5',
      landmark: 'Near Pharmacy',
    },
    coords: { latitude: 26.158, longitude: 32.72 },
  },
  {
    label: '🏢 Office - Admin Bldg',
    type: 'office',
    fields: {
      officeName: 'Student Services',
      street: 'Admin Building',
      floor: '2',
      landmark: 'Room 204',
    },
    coords: { latitude: 26.152, longitude: 32.714 },
  },
];

const PAYMENT_METHODS = [
  {
    key: 'cash',
    label: 'Cash on Delivery',
    desc: 'Pay cash when your order arrives',
    icon: FaMoneyBillWave,
  },
  {
    key: 'card',
    label: 'Credit / Debit Card',
    desc: 'Pay online securely via Card',
    icon: FaCreditCard,
  },
  {
    key: 'wallet',
    label: 'Digital Wallet',
    desc: 'Pay with Apple Pay, Mada or STC Pay',
    icon: FaWallet,
  },
];

const DELIVERY_FEE = 5;

const formatLocationString = (type, fields) => {
  if (type === 'campus') {
    const uni = fields.university || 'South Valley University';
    const fac = fields.faculty ? ` - ${fields.faculty}` : '';
    const point = fields.deliveryPoint ? ` (${fields.deliveryPoint})` : '';
    return `🎓 Campus: ${uni}${fac}${point}`;
  }
  if (type === 'home') {
    const street = fields.street || 'Home';
    const bldg = fields.building ? `, Bldg ${fields.building}` : '';
    const fl = fields.floor ? `, Fl ${fields.floor}` : '';
    const apt = fields.apartment ? `, Apt ${fields.apartment}` : '';
    const mark = fields.landmark ? ` (Ref: ${fields.landmark})` : '';
    return `🏠 Home: ${street}${bldg}${fl}${apt}${mark}`;
  }
  if (type === 'office') {
    const name = fields.officeName || 'Office';
    const street = fields.street ? `, ${fields.street}` : '';
    const fl = fields.floor ? `, Fl ${fields.floor}` : '';
    const mark = fields.landmark ? ` (Ref: ${fields.landmark})` : '';
    return `🏢 Office: ${name}${street}${fl}${mark}`;
  }
  return 'Specified Location';
};

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Order Details
  const [category, setCategory] = useState('food');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(25);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Pickup Location State
  const [pickupType, setPickupType] = useState('campus');
  const [pickupFields, setPickupFields] = useState({
    university: 'South Valley University',
    faculty: 'Faculty of Commerce',
    deliveryPoint: 'Main Gate',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    officeName: '',
    landmark: '',
  });
  const [pickupCoords, setPickupCoords] = useState({ latitude: 26.1551, longitude: 32.716 });

  // Destination Location State
  const initialDest = location.state?.selectedDestination;
  const [isPreselected, setIsPreselected] = useState(() => !!initialDest);
  const [preselectedInfo] = useState(() => initialDest || null);
  const [destType, setDestType] = useState(() => initialDest?.type || 'home');
  const [destFields, setDestFields] = useState(() => ({
    university: initialDest?.fields?.university || 'South Valley University',
    faculty: initialDest?.fields?.faculty || '',
    deliveryPoint: initialDest?.fields?.deliveryPoint || '',
    street: initialDest?.fields?.street || 'University Street',
    building: initialDest?.fields?.building || '12',
    floor: initialDest?.fields?.floor || '3',
    apartment: initialDest?.fields?.apartment || '5',
    officeName: initialDest?.fields?.officeName || '',
    landmark: initialDest?.fields?.landmark || 'Beside Pharmacy',
  }));
  const [destCoords, setDestCoords] = useState(
    () => initialDest?.coords || { latitude: 26.158, longitude: 32.72 },
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const itemSubtotal = price * quantity;
  const total = itemSubtotal + DELIVERY_FEE;

  const formattedPickup = formatLocationString(pickupType, pickupFields);
  const formattedDestination = formatLocationString(destType, destFields);

  const handleApplyPreset = (target, preset) => {
    if (target === 'pickup') {
      setPickupType(preset.type);
      setPickupFields((prev) => ({ ...prev, ...preset.fields }));
      if (preset.coords) setPickupCoords(preset.coords);
    } else {
      setDestType(preset.type);
      setDestFields((prev) => ({ ...prev, ...preset.fields }));
      if (preset.coords) setDestCoords(preset.coords);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!itemName.trim()) {
      errors.itemName = 'Item or order name is required.';
    }
    if (quantity < 1) {
      errors.quantity = 'Quantity must be at least 1.';
    }
    if (price < 0) {
      errors.price = 'Price per item cannot be negative.';
    }

    if (pickupType === 'campus' && !pickupFields.faculty.trim()) {
      errors.pickupFaculty = 'Please specify the Pickup Faculty / Building.';
    }
    if (pickupType === 'home' && (!pickupFields.street.trim() || !pickupFields.building.trim())) {
      errors.pickupHome = 'Please enter Street and Building Number for Pickup.';
    }
    if (
      pickupType === 'office' &&
      (!pickupFields.officeName.trim() || !pickupFields.street.trim())
    ) {
      errors.pickupOffice = 'Please enter Office Name and Building for Pickup.';
    }

    if (destType === 'campus' && !destFields.faculty.trim()) {
      errors.destFaculty = 'Please specify the Delivery Faculty / Building.';
    }
    if (destType === 'home' && (!destFields.street.trim() || !destFields.building.trim())) {
      errors.destHome = 'Please enter Street and Building Number for Delivery.';
    }
    if (destType === 'office' && (!destFields.officeName.trim() || !destFields.street.trim())) {
      errors.destOffice = 'Please enter Office Name and Building for Delivery.';
    }

    setFieldErrors(errors);
    const firstError = Object.values(errors)[0];
    return firstError || null;
  };

  const handlePlaceOrder = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      const pickupLocationDetails = {
        type: pickupType.toUpperCase(),
        address: pickupFields,
        coordinates: pickupCoords,
        formattedAddress: formattedPickup,
      };

      const destinationLocationDetails = {
        type: destType.toUpperCase(),
        address: destFields,
        coordinates: destCoords,
        formattedAddress: formattedDestination,
      };

      const res = await createOrder({
        pickup: formattedPickup,
        destination: formattedDestination,
        pickupLocationDetails,
        destinationLocationDetails,
        category: category,
        title: itemName.trim() || 'General Order',
        price: price,
        quantity: quantity,
        amount: total,
        paymentMethod: paymentMethod.toUpperCase(),
        notes: description,
      });

      if (res && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else if (res && (res.id || res._id)) {
        navigate(`/order-confirmation/${res.id || res._id}`);
      } else {
        navigate('/my-orders');
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];
  const selectedPaymentObj =
    PAYMENT_METHODS.find((p) => p.key === paymentMethod) || PAYMENT_METHODS[0];

  const buttonCtaLabel =
    paymentMethod === 'card' || paymentMethod === 'wallet'
      ? `Pay ${total} EGP & Place Order`
      : `Place Order — ${total} EGP`;

  return (
    <div className="new-order">
      <h1 className="new-order__title">Create New Order</h1>

      {/* Progress Flow Tracker */}
      <div className="no-progress-bar">
        <div className="no-progress-step no-progress-step--active">
          <span className="no-progress-step__num">1</span>
          <span>Category</span>
        </div>
        <div className="no-progress-divider" />
        <div className="no-progress-step no-progress-step--active">
          <span className="no-progress-step__num">2</span>
          <span>Details</span>
        </div>
        <div className="no-progress-divider" />
        <div className="no-progress-step no-progress-step--active">
          <span className="no-progress-step__num">3</span>
          <span>Pickup</span>
        </div>
        <div className="no-progress-divider" />
        <div className="no-progress-step no-progress-step--active">
          <span className="no-progress-step__num">4</span>
          <span>Destination</span>
        </div>
        <div className="no-progress-divider" />
        <div className="no-progress-step no-progress-step--active">
          <span className="no-progress-step__num">5</span>
          <span>Payment</span>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: '#ba1a1a',
            backgroundColor: '#ffdad6',
            padding: '14px 18px',
            borderRadius: '14px',
            marginBottom: '20px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <FaExclamationCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="new-order__layout">
        <div className="new-order__left">
          {/* STEP 1: CATEGORY SELECTION */}
          <section className="no-card">
            <div className="no-card__header">
              <h2 className="no-card__title">1. What are you ordering?</h2>
              <p className="no-card__subtitle">
                Select the category that best matches your request
              </p>
            </div>

            <div className="no-category-grid" role="radiogroup" aria-label="Order Category">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`no-category-card ${isSelected ? 'no-category-card--active' : ''}`}
                    onClick={() => setCategory(cat.key)}
                  >
                    <div className="no-category-card__header">
                      <div
                        className="no-category-card__icon-badge"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        <IconComponent />
                      </div>
                      {isSelected && <FaCheckCircle className="no-category-card__check" />}
                    </div>

                    <div className="no-category-card__body">
                      <span className="no-category-card__title">{cat.label}</span>
                      <span className="no-category-card__desc">{cat.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: ORDER DETAILS & CALCULATION */}
          <section className="no-card">
            <div className="no-card__header">
              <h2 className="no-card__title">2. Order Information</h2>
              <p className="no-card__subtitle">Specify item details, quantity and item price</p>
            </div>

            <div className="no-field">
              <label className="no-field__label">Item / Order Name *</label>
              <p className="no-field__helper">What do you want the rider to get for you?</p>
              <input
                className="no-field__input"
                placeholder="e.g., CS Lecture Notes, Chicken Shawarma, Math Textbook"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  if (fieldErrors.itemName) setFieldErrors((p) => ({ ...p, itemName: null }));
                }}
              />
              {fieldErrors.itemName && (
                <span className="no-field__error">{fieldErrors.itemName}</span>
              )}
            </div>

            <div className="no-field">
              <label className="no-field__label">Special Instructions / Notes (Optional)</label>
              <p className="no-field__helper">
                Add brand, size, flavor, or specific pickup instructions
              </p>
              <textarea
                className="no-field__textarea"
                placeholder="e.g., Please ask for extra garlic sauce; print double-sided..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Quantity & Price Calculation Group */}
            <div className="no-calc-box">
              <div className="no-field">
                <label className="no-field__label">Quantity</label>
                <p className="no-field__helper">How many items?</p>
                <div className="no-quantity">
                  <button
                    type="button"
                    className="no-quantity__btn"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="no-quantity__value">{quantity}</span>
                  <button
                    type="button"
                    className="no-quantity__btn"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                {fieldErrors.quantity && (
                  <span className="no-field__error">{fieldErrors.quantity}</span>
                )}
              </div>

              <div className="no-field">
                <label className="no-field__label">Item Price (EGP)</label>
                <p className="no-field__helper">Price per item</p>
                <div className="no-field__price-input">
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => {
                      setPrice(Math.max(0, Number(e.target.value)));
                      if (fieldErrors.price) setFieldErrors((p) => ({ ...p, price: null }));
                    }}
                  />
                  <span>EGP</span>
                </div>
                {fieldErrors.price && <span className="no-field__error">{fieldErrors.price}</span>}
              </div>
            </div>
          </section>

          {/* STEP 3: PICKUP LOCATION & MAP */}
          <section className="no-card no-card--pickup">
            <div className="no-card__header">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2 className="no-card__title">
                  <FaMapMarkerAlt style={{ color: '#156B82' }} /> 🛍️ 3. Pickup Location
                </h2>
                <span className="no-card__step-badge">Step A</span>
              </div>
              <p className="no-card__subtitle">Where should the rider pick up your order?</p>
            </div>

            {/* Quick Pick Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SAVED_ADDRESS_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset('pickup', preset)}
                  className="no-preset-chip"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Location Type Selector */}
            <div className="no-field">
              <label className="no-field__label">Pickup Location Type</label>
              <div
                className="no-location-types"
                role="radiogroup"
                aria-label="Pickup Location Type"
              >
                {LOCATION_TYPES.map((type) => {
                  const TypeIcon = type.icon;
                  const isSelected = pickupType === type.key;
                  return (
                    <button
                      key={type.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`no-location-type-btn ${
                        isSelected ? 'no-location-type-btn--active' : ''
                      }`}
                      onClick={() => setPickupType(type.key)}
                    >
                      <TypeIcon />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Pickup Address Fields */}
            {pickupType === 'campus' && (
              <div className="no-field-group">
                <div className="no-field">
                  <label className="no-field__label">University</label>
                  <input
                    className="no-field__input"
                    value={pickupFields.university}
                    onChange={(e) =>
                      setPickupFields({ ...pickupFields, university: e.target.value })
                    }
                  />
                </div>
                <div className="no-field">
                  <label className="no-field__label">Faculty / Building *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Faculty of Commerce, Building A"
                    value={pickupFields.faculty}
                    onChange={(e) => {
                      setPickupFields({ ...pickupFields, faculty: e.target.value });
                      if (fieldErrors.pickupFaculty)
                        setFieldErrors((p) => ({ ...p, pickupFaculty: null }));
                    }}
                  />
                  {fieldErrors.pickupFaculty && (
                    <span className="no-field__error">{fieldErrors.pickupFaculty}</span>
                  )}
                </div>
                <div className="no-field">
                  <label className="no-field__label">Delivery Point (Optional)</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Main Gate, Library Entrance"
                    value={pickupFields.deliveryPoint}
                    onChange={(e) =>
                      setPickupFields({ ...pickupFields, deliveryPoint: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {pickupType === 'home' && (
              <div className="no-field-group">
                <div className="no-field">
                  <label className="no-field__label">Area / Street *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. University Street"
                    value={pickupFields.street}
                    onChange={(e) => setPickupFields({ ...pickupFields, street: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="no-field">
                    <label className="no-field__label">Building *</label>
                    <input
                      className="no-field__input"
                      placeholder="12"
                      value={pickupFields.building}
                      onChange={(e) =>
                        setPickupFields({ ...pickupFields, building: e.target.value })
                      }
                    />
                  </div>
                  <div className="no-field">
                    <label className="no-field__label">Floor</label>
                    <input
                      className="no-field__input"
                      placeholder="3"
                      value={pickupFields.floor}
                      onChange={(e) => setPickupFields({ ...pickupFields, floor: e.target.value })}
                    />
                  </div>
                  <div className="no-field">
                    <label className="no-field__label">Apt</label>
                    <input
                      className="no-field__input"
                      placeholder="5"
                      value={pickupFields.apartment}
                      onChange={(e) =>
                        setPickupFields({ ...pickupFields, apartment: e.target.value })
                      }
                    />
                  </div>
                </div>
                {fieldErrors.pickupHome && (
                  <span className="no-field__error">{fieldErrors.pickupHome}</span>
                )}
              </div>
            )}

            {pickupType === 'office' && (
              <div className="no-field-group">
                <div className="no-field">
                  <label className="no-field__label">Office / Company Name *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Student Services"
                    value={pickupFields.officeName}
                    onChange={(e) =>
                      setPickupFields({ ...pickupFields, officeName: e.target.value })
                    }
                  />
                </div>
                <div className="no-field">
                  <label className="no-field__label">Building / Street *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Admin Building"
                    value={pickupFields.street}
                    onChange={(e) => setPickupFields({ ...pickupFields, street: e.target.value })}
                  />
                </div>
                {fieldErrors.pickupOffice && (
                  <span className="no-field__error">{fieldErrors.pickupOffice}</span>
                )}
              </div>
            )}

            {/* Interactive Pickup Map Picker */}
            <div className="no-field">
              <label className="no-field__label">📍 PICKUP POINT ON MAP</label>
              <p className="no-field__helper">
                Move the pin to the exact place where the rider should collect your order.
              </p>
              <LocationPickerMap
                locationName="Pick up from"
                initialCoords={pickupCoords}
                onSelectLocation={(c) => setPickupCoords(c)}
              />
            </div>
          </section>

          {/* Visual Route Connector */}
          <div className="no-route-connector">
            <div className="no-route-connector__line" />
            <span className="no-route-connector__badge">
              🛍️ Pickup → 🛵 Rider → 🏠 Delivery Route
            </span>
          </div>

          {/* STEP 4: DESTINATION LOCATION & MAP */}
          <section className="no-card no-card--dest">
            <div className="no-card__header">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2 className="no-card__title">
                  <FaFlagCheckered style={{ color: '#2E9E6B' }} /> 🏠 4. Delivery Destination
                </h2>
                <span className="no-card__step-badge no-card__step-badge--dest">Step B</span>
              </div>
              <p className="no-card__subtitle">Where should the rider deliver your order?</p>
            </div>

            {/* Pre-selected Destination Banner from Header Search */}
            {isPreselected && preselectedInfo && (
              <div
                style={{
                  background: '#F0F8FA',
                  border: '1px solid #74BECE',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#156B82',
                      fontWeight: '800',
                      letterSpacing: '0.04em',
                    }}
                  >
                    📍 PRE-SELECTED DESTINATION FROM SEARCH
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '800',
                      color: '#263238',
                      marginTop: '2px',
                    }}
                  >
                    {preselectedInfo.name || preselectedInfo.displayTitle}
                  </div>
                  <div style={{ fontSize: '12px', color: '#607D8B' }}>
                    {preselectedInfo.address || preselectedInfo.displaySub}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreselected(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #156B82',
                    background: '#ffffff',
                    color: '#156B82',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Change
                </button>
              </div>
            )}

            {/* Quick Pick Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SAVED_ADDRESS_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset('destination', preset)}
                  className="no-preset-chip"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Location Type Selector */}
            <div className="no-field">
              <label className="no-field__label">Delivery Location Type</label>
              <div
                className="no-location-types"
                role="radiogroup"
                aria-label="Delivery Location Type"
              >
                {LOCATION_TYPES.map((type) => {
                  const TypeIcon = type.icon;
                  const isSelected = destType === type.key;
                  return (
                    <button
                      key={type.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`no-location-type-btn ${
                        isSelected ? 'no-location-type-btn--active' : ''
                      }`}
                      onClick={() => setDestType(type.key)}
                    >
                      <TypeIcon />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Destination Address Fields */}
            {destType === 'campus' && (
              <div className="no-field-group">
                <div className="no-field">
                  <label className="no-field__label">University</label>
                  <input
                    className="no-field__input"
                    value={destFields.university}
                    onChange={(e) => setDestFields({ ...destFields, university: e.target.value })}
                  />
                </div>
                <div className="no-field">
                  <label className="no-field__label">Faculty / Building *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Faculty of Science"
                    value={destFields.faculty}
                    onChange={(e) => {
                      setDestFields({ ...destFields, faculty: e.target.value });
                      if (fieldErrors.destFaculty)
                        setFieldErrors((p) => ({ ...p, destFaculty: null }));
                    }}
                  />
                  {fieldErrors.destFaculty && (
                    <span className="no-field__error">{fieldErrors.destFaculty}</span>
                  )}
                </div>
              </div>
            )}

            {destType === 'home' && (
              <div className="no-field-group">
                <div className="no-field">
                  <label className="no-field__label">Area / Street *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. University Street"
                    value={destFields.street}
                    onChange={(e) => setDestFields({ ...destFields, street: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="no-field">
                    <label className="no-field__label">Building *</label>
                    <input
                      className="no-field__input"
                      placeholder="12"
                      value={destFields.building}
                      onChange={(e) => setDestFields({ ...destFields, building: e.target.value })}
                    />
                  </div>
                  <div className="no-field">
                    <label className="no-field__label">Floor</label>
                    <input
                      className="no-field__input"
                      placeholder="3"
                      value={destFields.floor}
                      onChange={(e) => setDestFields({ ...destFields, floor: e.target.value })}
                    />
                  </div>
                  <div className="no-field">
                    <label className="no-field__label">Apt</label>
                    <input
                      className="no-field__input"
                      placeholder="5"
                      value={destFields.apartment}
                      onChange={(e) => setDestFields({ ...destFields, apartment: e.target.value })}
                    />
                  </div>
                </div>
                {fieldErrors.destHome && (
                  <span className="no-field__error">{fieldErrors.destHome}</span>
                )}
              </div>
            )}

            {destType === 'office' && (
              <div className="no-field-group">
                <div className="no-field">
                  <label className="no-field__label">Office / Company Name *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Tech Support Desk"
                    value={destFields.officeName}
                    onChange={(e) => setDestFields({ ...destFields, officeName: e.target.value })}
                  />
                </div>
                <div className="no-field">
                  <label className="no-field__label">Building / Street *</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Science Building"
                    value={destFields.street}
                    onChange={(e) => setDestFields({ ...destFields, street: e.target.value })}
                  />
                </div>
                {fieldErrors.destOffice && (
                  <span className="no-field__error">{fieldErrors.destOffice}</span>
                )}
              </div>
            )}

            {/* Interactive Destination Map Picker */}
            <div className="no-field">
              <label className="no-field__label">🏁 DELIVERY POINT ON MAP</label>
              <p className="no-field__helper">
                Move the pin to the exact place where you want to receive your order.
              </p>
              <LocationPickerMap
                locationName="Deliver to"
                initialCoords={destCoords}
                onSelectLocation={(c) => setDestCoords(c)}
              />
            </div>
          </section>

          {/* STEP 5: PAYMENT METHOD */}
          <section className="no-card">
            <div className="no-card__header">
              <h2 className="no-card__title">5. How will you pay?</h2>
              <p className="no-card__subtitle">Select your preferred payment method</p>
            </div>

            <div className="no-payment-list" role="radiogroup" aria-label="Payment Method">
              {PAYMENT_METHODS.map((pm) => {
                const PayIcon = pm.icon;
                const isSelected = paymentMethod === pm.key;
                return (
                  <label
                    key={pm.key}
                    className={`no-payment-item ${isSelected ? 'no-payment-item--active' : ''}`}
                  >
                    <div className="no-payment-item__left">
                      <PayIcon className="no-payment-item__icon" />
                      <div>
                        <p className="no-payment-item__label">{pm.label}</p>
                        <p className="no-payment-item__desc">{pm.desc}</p>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="payment"
                      value={pm.key}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(pm.key)}
                      className="no-payment-item__radio"
                    />
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT SIDE ORDER SUMMARY PANEL */}
        <aside className="no-summary">
          <h2 className="no-summary__title">
            <span>ORDER SUMMARY</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: selectedCategoryObj.bg,
                color: selectedCategoryObj.color,
              }}
            >
              {selectedCategoryObj.label}
            </span>
          </h2>

          <div className="no-summary__rows">
            <div className="no-summary__row">
              <span>Item ({quantity}x)</span>
              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>
                {itemName.trim() || 'General Item'}
              </span>
            </div>

            <div className="no-summary__row">
              <span>Item Price</span>
              <span>{price} EGP</span>
            </div>

            <div
              className="no-summary__row"
              style={{
                borderTop: '1px dashed #d8eef5',
                paddingTop: '6px',
                fontWeight: '700',
                color: '#263238',
              }}
            >
              <span>Items Total</span>
              <span>{itemSubtotal} EGP</span>
            </div>

            <div className="no-summary__row">
              <span>Delivery Fee</span>
              <span>{DELIVERY_FEE} EGP</span>
            </div>

            <div className="no-summary__row">
              <span>Payment Method</span>
              <span style={{ fontWeight: '600', color: '#156B82' }}>
                {selectedPaymentObj.label}
              </span>
            </div>
          </div>

          <div className="no-summary__total">
            <span>Order Total</span>
            <span className="no-summary__total-value">{total} EGP</span>
          </div>

          {/* Location Previews with Coords */}
          <div
            style={{
              fontSize: '12px',
              background: '#F4FBFD',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #D8EEF5',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div>
              <strong style={{ color: '#156B82' }}>Pick up from:</strong>
              <div style={{ color: '#263238' }}>{formattedPickup}</div>
              <div style={{ color: '#607D8B', fontSize: '11px', marginTop: '2px' }}>
                📍 ({pickupCoords.latitude}, {pickupCoords.longitude})
              </div>
            </div>
            <div style={{ borderTop: '1px solid #D8EEF5', paddingTop: '6px' }}>
              <strong style={{ color: '#2E9E6B' }}>Deliver to:</strong>
              <div style={{ color: '#263238' }}>{formattedDestination}</div>
              <div style={{ color: '#607D8B', fontSize: '11px', marginTop: '2px' }}>
                🏁 ({destCoords.latitude}, {destCoords.longitude})
              </div>
            </div>
          </div>

          <button className="no-summary__place-btn" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="fa-spin" /> Placing Order...
              </>
            ) : (
              buttonCtaLabel
            )}
          </button>

          <p className="no-summary__terms">
            By placing this order, you agree to Makook Terms & Conditions
          </p>
        </aside>
      </div>
    </div>
  );
};

export default NewOrder;
