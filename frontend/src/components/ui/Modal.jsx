import React from 'react';

export default function Modal({ isOpen, onClose, children, ...props }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" {...props} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
