import React, { useState } from 'react';
import './Alert.css';

const defaultIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const Alert = ({
  variant = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  children,
  className = '',
  ...props
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  const classNames = ['ui-alert', `ui-alert--${variant}`, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="alert" aria-live="polite" {...props}>
      <span className="ui-alert__icon">{defaultIcons[variant] || defaultIcons.info}</span>
      <div className="ui-alert__content">
        {title && <div className="ui-alert__title">{title}</div>}
        {description && <p className="ui-alert__description">{description}</p>}
        {children}
      </div>
      {dismissible && (
        <button
          type="button"
          className="ui-alert__dismiss-btn"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
