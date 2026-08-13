import React from 'react';
import './Container.css';

const Container = React.forwardRef(
  (
    {
      children,
      maxWidth = 'xl',
      centered = true,
      padding = 'medium',
      className = '',
      as: Component = 'div',
      ...props
    },
    ref,
  ) => {
    const classNames = [
      'ui-container',
      `ui-container--max-${maxWidth}`,
      `ui-container--padding-${padding}`,
      centered ? 'ui-container--centered' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component ref={ref} className={classNames} {...props}>
        {children}
      </Component>
    );
  },
);

Container.displayName = 'Container';

export default Container;
