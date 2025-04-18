import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { login, logout, register, updateProfile } from '../features/auth/authSlice';
import type { User } from '../types/cart';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      return !!result;
    } catch (error) {
      return false;
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      const result = await dispatch(register({ email, password, name })).unwrap();
      return !!result;
    } catch (error) {
      return false;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleUpdateProfile = async (userData: Partial<User>) => {
    try {
      const result = await dispatch(updateProfile(userData)).unwrap();
      return !!result;
    } catch (error) {
      return false;
    }
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
  };
}; 