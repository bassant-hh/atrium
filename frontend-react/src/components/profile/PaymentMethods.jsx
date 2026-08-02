import"./PaymentMethods.css"
const CARDS = [
  { type: "VISA", last4: "4242", expires: "12/26", isDefault: true,  bg: "#2563EB" },
  { type: "MADA", last4: "8888", expires: "08/27", isDefault: false, bg: "linear-gradient(135deg, #34809A, #BAEAFF)" },
];

const PaymentMethods = () => {
  return (
    <div className="pm-card">

      <div className="pm-card__header">
        <div>
          <h3 className="pm-card__title">Payment Methods</h3>
          <p className="pm-card__subtitle">Your saved cards</p>
        </div>
        <button className="pm-card__add-btn">+ Add Card</button>
      </div>

      <div className="pm-card__list">
        {CARDS.map((card) => (
          <div key={card.last4} className="pm-card__item">
            <div className="pm-card__info">

              <div
                className="pm-card__badge"
                style={{ background: card.bg }}
              >
                {card.type}
              </div>

              <div>
                <p className="pm-card__number">*** *** *** {card.last4}</p>
                <p className="pm-card__exp">Expires {card.expires}</p>
              </div>
            </div>

            {card.isDefault && (
              <span className="pm-card__default">Default</span>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default PaymentMethods;