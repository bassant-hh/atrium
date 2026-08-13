import React from 'react';
import './SectionTitle.css';

const SectionTitle = ({
  eyebrow,
  title,
  subtitle,
  alignment = 'center',
  className = '',
  as: HeadingTag = 'h2',
  ...props
}) => {
  const classNames = ['ui-section-title', `ui-section-title--align-${alignment}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} {...props}>
      {eyebrow && <span className="ui-section-title__eyebrow">{eyebrow}</span>}
      {title && <HeadingTag className="ui-section-title__title">{title}</HeadingTag>}
      {subtitle && <p className="ui-section-title__subtitle">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
