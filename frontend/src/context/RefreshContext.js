import React, { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [key, setKey] = useState(0);
  const triggerRefresh = useCallback(() => setKey((k) => k + 1), []);
  return (
    <RefreshContext.Provider value={{ key, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
