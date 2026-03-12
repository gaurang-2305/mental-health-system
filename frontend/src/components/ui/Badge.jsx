import React from 'react';

export default function Badge({ children, variant = 'default', ...props }) {
  return (
    <span className={`badge badge-${variant}`} {...props}>
      {children}
    </span>
  );
}
