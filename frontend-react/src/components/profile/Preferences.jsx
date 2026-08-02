import { useState } from "react";
import "./Preferences.css"

const PREFS = [
  { key: "email", label: "Email Notifications",  desc: "Receive order updates via email",  default: true  },
  { key: "sms",   label: "SMS Notifications",    desc: "Get delivery updates via SMS",     default: true  },
  { key: "promo", label: "Promotional Offers",   desc: "Receive special deals and offers", default: false },
];

const Preferences = () => {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(PREFS.map(p => [p.key, p.default]))
  );
  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="prefs-card">
      
      <div className="prefs-card__header">
        <div>
          <h3 className="prefs-card__title">Preferences</h3>
          <p className="prefs-card__subtitle">Manage your notification settings</p>
        </div>
      </div>

      <div className="prefs-card__list">
        {PREFS.map((pref, i) => (
          <div
            key={pref.key}
            className={`prefs-card__item ${i < PREFS.length - 1 ? "prefs-card__item--bordered" : ""}`}
          >
            <div>
              <p className="prefs-card__label">{pref.label}</p>
              <p className="prefs-card__desc">{pref.desc}</p>
            </div>

            <div
              className={`prefs-card__toggle ${prefs[pref.key] ? "prefs-card__toggle--on" : ""}`}
              onClick={() => toggle(pref.key)}
            >
              <div className="prefs-card__toggle-thumb" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Preferences;