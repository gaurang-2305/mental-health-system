// High-risk alert banner
import React from 'react';

export default function CrisisBanner({ severity, message, ...props }) {
  return (
    <div className={`crisis-banner crisis-${severity}`} {...props}>
      {message}
    </div>
  );
}
