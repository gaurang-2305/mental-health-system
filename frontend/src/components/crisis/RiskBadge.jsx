// Risk level indicator
import React from 'react';

export default function RiskBadge({ level, ...props }) {
  return (
    <span className={`risk-badge risk-${level}`} {...props}>
      {level}
    </span>
  );
}
