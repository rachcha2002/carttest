import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Here you would make an API call to your authentication service
      // const response = await api.post('/auth/login', { email, password });
      // Mock successful login for now
      const userData = { id: '123', name: 'Test Driver', email, role: 'driver' };
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // Here you would make an API call to your authentication service
      // const response = await api.post('/auth/register', userData);
      // Mock successful registration
      const newUser = { id: '123', ...userData, role: 'driver' };
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
