// Auth guard by role
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user, requiredRole }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
