import React from 'react';
import './Card.css';

const Card = React.forwardRef(
  (
    {
      children,
      padding = 'medium',
      shadow = 'xs',
      border = true,
      hover = false,
      className = '',
      ...props
    },
    ref,
  ) => {
    const classNames = [
      'ui-card',
      `ui-card--padding-${padding}`,
      `ui-card--shadow-${shadow}`,
      border ? 'ui-card--bordered' : '',
      hover ? 'ui-card--hoverable' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
