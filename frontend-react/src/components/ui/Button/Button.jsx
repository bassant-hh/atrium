import React from 'react';
import Spinner from '../Spinner/Spinner';
import './Button.css';

const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      type = 'button',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      onClick,
      className = '',
      ...props
    },
    ref,
  ) => {
    const classNames = [
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      fullWidth ? 'ui-button--full-width' : '',
      loading ? 'ui-button--loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={disabled || loading}
        onClick={onClick}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Spinner size="small" />
        ) : (
          leftIcon && <span className="ui-button__icon">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="ui-button__icon">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
