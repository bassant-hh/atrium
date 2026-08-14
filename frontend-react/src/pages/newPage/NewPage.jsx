import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder } from '../../services/order.service';
import LocationPickerMap from '../../components/map/LocationPickerMap';
import './newPage.css';

const CATEGORIES = [
  { key: 'food', label: 'Food', icon: '🍕' },
  { key: 'printing', label: 'Printing', icon: '🖨️' },
  { key: 'stationery', label: 'Stationery', icon: '✏️' },
  { key: 'books', label: 'Books', icon: '📚' },
];

const LOCATION_TYPES = [
  { key: 'campus', label: 'Campus', icon: '🎓' },
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'office', label: 'Office', icon: '🏢' },
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
  { key: 'cash', label: 'Cash on Delivery', desc: 'Pay when you receive' },
  { key: 'card', label: 'Credit/Debit Card', desc: 'Pay online now' },
  { key: 'wallet', label: 'Digital Wallet', desc: 'Apple Pay, Mada, STC Pay' },
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

  const total = price * quantity + DELIVERY_FEE;

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
    if (!itemName.trim()) {
      return 'Please enter an item name.';
    }
    if (pickupType === 'campus' && !pickupFields.faculty.trim()) {
      return 'Please specify the Pickup Faculty / Building.';
    }
    if (pickupType === 'home' && (!pickupFields.street.trim() || !pickupFields.building.trim())) {
      return 'Please enter Street and Building Number for Pickup.';
    }
    if (
      pickupType === 'office' &&
      (!pickupFields.officeName.trim() || !pickupFields.street.trim())
    ) {
      return 'Please enter Office Name and Building for Pickup.';
    }
    if (destType === 'campus' && !destFields.faculty.trim()) {
      return 'Please specify the Delivery Faculty / Building.';
    }
    if (destType === 'home' && (!destFields.street.trim() || !destFields.building.trim())) {
      return 'Please enter Street and Building Number for Delivery.';
    }
    if (destType === 'office' && (!destFields.officeName.trim() || !destFields.street.trim())) {
      return 'Please enter Office Name and Building for Delivery.';
    }
    return null;
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

      await createOrder({
        pickup: formattedPickup,
        destination: formattedDestination,
        pickupLocationDetails,
        destinationLocationDetails,
        category: category,
        title: itemName.trim() || 'General Order',
        amount: total,
        notes: description,
      });

      navigate('/my-orders');
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-order">
      <h1 className="new-order__title">Create New Order</h1>

      {error && (
        <div
          style={{
            color: '#ba1a1a',
            backgroundColor: '#ffdad6',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div className="new-order__layout">
        <div className="new-order__left">
          {/* Category */}
          <section className="no-card">
            <h2 className="no-card__title">1. Select Category</h2>

            <div className="no-category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`no-category-btn ${
                    category === cat.key ? 'no-category-btn--active' : ''
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
            <h2 className="no-card__title">2. Order Information</h2>

            <div className="no-field">
              <label className="no-field__label">Item / Order Name *</label>
              <input
                className="no-field__input"
                placeholder="e.g., CS Lecture Notes, Chicken Shawarma"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div className="no-field">
              <label className="no-field__label">Special Instructions / Notes</label>
              <textarea
                className="no-field__textarea"
                placeholder="Add any specific instructions for pickup or delivery..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Quantity & Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="no-field">
                <label className="no-field__label">Quantity</label>
                <div className="no-quantity">
                  <button
                    type="button"
                    className="no-quantity__btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="no-quantity__value">{quantity}</span>
                  <button
                    type="button"
                    className="no-quantity__btn"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="no-field">
                <label className="no-field__label">Item Price (per unit)</label>
                <div className="no-field__price-input">
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                  />
                  <span>SAR</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pickup Address & Map Section */}
          <section className="no-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="no-card__title">3. Pickup Location & Pin Selection</h2>
              <span style={{ fontSize: '12px', color: '#607D8B' }}>Step A</span>
            </div>

            {/* Quick Pick Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SAVED_ADDRESS_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset('pickup', preset)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #D8EEF5',
                    background: '#F4FBFD',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#156B82',
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Location Type Selector */}
            <div className="no-location-types">
              {LOCATION_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  className={`no-location-type-btn ${
                    pickupType === type.key ? 'no-location-type-btn--active' : ''
                  }`}
                  onClick={() => setPickupType(type.key)}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
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
                    onChange={(e) => setPickupFields({ ...pickupFields, faculty: e.target.value })}
                  />
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
                <div className="no-field">
                  <label className="no-field__label">Landmark (Optional)</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Near Pharmacy"
                    value={pickupFields.landmark}
                    onChange={(e) => setPickupFields({ ...pickupFields, landmark: e.target.value })}
                  />
                </div>
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
                <div className="no-field">
                  <label className="no-field__label">Landmark / Office No. (Optional)</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Room 204"
                    value={pickupFields.landmark}
                    onChange={(e) => setPickupFields({ ...pickupFields, landmark: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Interactive Pickup Map Picker */}
            <LocationPickerMap
              locationName="Pickup Location"
              initialCoords={pickupCoords}
              onSelectLocation={(c) => setPickupCoords(c)}
            />
          </section>

          {/* Destination Address & Map Section */}
          <section className="no-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="no-card__title">4. Destination Location & Pin Selection</h2>
              <span style={{ fontSize: '12px', color: '#607D8B' }}>Step B</span>
            </div>

            {/* Pre-selected Destination Banner from Header Search */}
            {isPreselected && preselectedInfo && (
              <div
                style={{
                  background: '#F0F8FA',
                  border: '1px solid #74BECE',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
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
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #D8EEF5',
                    background: '#F4FBFD',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#156B82',
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Location Type Selector */}
            <div className="no-location-types">
              {LOCATION_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  className={`no-location-type-btn ${
                    destType === type.key ? 'no-location-type-btn--active' : ''
                  }`}
                  onClick={() => setDestType(type.key)}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
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
                    onChange={(e) => setDestFields({ ...destFields, faculty: e.target.value })}
                  />
                </div>
                <div className="no-field">
                  <label className="no-field__label">Delivery Point (Optional)</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. East Gate"
                    value={destFields.deliveryPoint}
                    onChange={(e) =>
                      setDestFields({ ...destFields, deliveryPoint: e.target.value })
                    }
                  />
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
                <div className="no-field">
                  <label className="no-field__label">Landmark (Optional)</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Beside Pharmacy"
                    value={destFields.landmark}
                    onChange={(e) => setDestFields({ ...destFields, landmark: e.target.value })}
                  />
                </div>
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
                <div className="no-field">
                  <label className="no-field__label">Landmark / Office No. (Optional)</label>
                  <input
                    className="no-field__input"
                    placeholder="e.g. Room 102"
                    value={destFields.landmark}
                    onChange={(e) => setDestFields({ ...destFields, landmark: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Interactive Destination Map Picker */}
            <LocationPickerMap
              locationName="Destination Location"
              initialCoords={destCoords}
              onSelectLocation={(c) => setDestCoords(c)}
            />
          </section>

          {/* Payment Method */}
          <section className="no-card">
            <h2 className="no-card__title">5. Payment Method</h2>
            <div className="no-payment-list">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.key}
                  className={`no-payment-item ${
                    paymentMethod === pm.key ? 'no-payment-item--active' : ''
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

        {/* RIGHT SIDE SUMMARY */}
        <aside className="no-summary">
          <h2 className="no-summary__title">Order Summary</h2>

          <div className="no-summary__rows">
            <div className="no-summary__row">
              <span>Category</span>
              <span style={{ fontWeight: '600', color: '#263238' }}>{category.toUpperCase()}</span>
            </div>

            <div className="no-summary__row">
              <span>Item ({quantity}x)</span>
              <span>{price * quantity} SAR</span>
            </div>

            <div className="no-summary__row">
              <span>Delivery Fee</span>
              <span>{DELIVERY_FEE} SAR</span>
            </div>
          </div>

          <div className="no-summary__total">
            <span>Total Customer Price</span>
            <span className="no-summary__total-value">{total} SAR</span>
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
              <strong style={{ color: '#156B82' }}>Pickup:</strong>
              <div style={{ color: '#263238' }}>{formattedPickup}</div>
              <div style={{ color: '#607D8B', fontSize: '11px', marginTop: '2px' }}>
                📍 Coordinates: ({pickupCoords.latitude}, {pickupCoords.longitude})
              </div>
            </div>
            <div style={{ borderTop: '1px solid #D8EEF5', paddingTop: '6px' }}>
              <strong style={{ color: '#156B82' }}>Destination:</strong>
              <div style={{ color: '#263238' }}>{formattedDestination}</div>
              <div style={{ color: '#607D8B', fontSize: '11px', marginTop: '2px' }}>
                🏁 Coordinates: ({destCoords.latitude}, {destCoords.longitude})
              </div>
            </div>
          </div>

          <div className="no-summary__meta">
            <p>
              <i className="fa-regular fa-clock"></i> Estimated Time: 15–30 mins
            </p>
          </div>

          <button className="no-summary__place-btn" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? 'Placing Order...' : 'Confirm & Place Order'}
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
