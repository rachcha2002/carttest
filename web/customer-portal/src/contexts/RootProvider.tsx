import React from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ThemeProvider } from './ThemeContext';

export const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}; 