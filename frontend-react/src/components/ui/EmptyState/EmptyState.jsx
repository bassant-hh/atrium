import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  icon = '📦',
  title = 'No items found',
  description,
  action,
  className = '',
  ...props
}) => {
  const classNames = ['ui-empty-state', className].filter(Boolean).join(' ');

  return (
    <div className={classNames} {...props}>
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      {title && <h3 className="ui-empty-state__title">{title}</h3>}
      {description && <p className="ui-empty-state__description">{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
