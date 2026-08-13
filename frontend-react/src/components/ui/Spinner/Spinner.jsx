import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', label = 'Loading...', color, className = '', ...props }) => {
  const spinnerClasses = ['ui-spinner', `ui-spinner--${size}`, className].filter(Boolean).join(' ');

  const style = color ? { color } : undefined;

  return (
    <div className="ui-spinner-wrap" role="status" aria-live="polite" {...props}>
      <span className={spinnerClasses} style={style} />
      {label && <span className="ui-spinner__label">{label}</span>}
      <span className="sr-only" style={{ display: 'none' }}>
        {label}
      </span>
    </div>
  );
};

export default Spinner;
