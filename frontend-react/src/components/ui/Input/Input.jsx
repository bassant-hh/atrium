import React, { useId } from 'react';
import './Input.css';

const Input = React.forwardRef(
  (
    {
      label,
      helperText,
      error,
      required = false,
      disabled = false,
      placeholder,
      type = 'text',
      value,
      onChange,
      id,
      name,
      autoComplete,
      prefix,
      suffix,
      className = '',
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;

    const inputClasses = [
      'ui-input-field',
      error ? 'ui-input-field--error' : '',
      prefix ? 'ui-input-field--has-prefix' : '',
      suffix ? 'ui-input-field--has-suffix' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="ui-input-group">
        {label && (
          <label htmlFor={inputId} className="ui-input-label">
            <span>{label}</span>
            {required && <span className="ui-input-label__required">*</span>}
          </label>
        )}

        <div className="ui-input-wrapper">
          {prefix && <span className="ui-input-affix ui-input-affix--prefix">{prefix}</span>}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={helperText || error ? helperId : undefined}
            {...props}
          />

          {suffix && <span className="ui-input-affix ui-input-affix--suffix">{suffix}</span>}
        </div>

        {(error || helperText) && (
          <span
            id={helperId}
            className={`ui-input-helper ${error ? 'ui-input-helper--error' : ''}`}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
