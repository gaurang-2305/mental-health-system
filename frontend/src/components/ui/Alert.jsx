import React from 'react';

export default function Alert({ message, type = 'info', ...props }) {
  return (
    <div className={`alert alert-${type}`} {...props}>
      {message}
    </div>
  );
}
