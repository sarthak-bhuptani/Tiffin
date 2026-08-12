import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user] = useState({
    name: 'Business Owner',
    email: 'admin@tiffin.com',
    role: 'admin',
  });

  const login = async () => user;
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
