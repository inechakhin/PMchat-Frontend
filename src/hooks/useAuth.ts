import { useAuthStore } from '@/store/auth-store';
import { signup } from '@/lib/auth-api';
import { useCallback } from 'react';

export const useAuth = () => {
  const { user, isLoading, fetchUser, login, logout, refresh } = useAuthStore();

  const isAuthenticated = !!user;

  const signupAndLogin = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      await signup({ first_name: firstName, last_name: lastName, email, password });
      await login(email, password);
    },
    [login]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refresh,
    signup: signupAndLogin,
    refetch: fetchUser,
  };
};