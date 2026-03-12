import React, { createContext } from 'react';

export const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}
