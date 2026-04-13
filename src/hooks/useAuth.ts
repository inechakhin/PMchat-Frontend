import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import * as authApi from '@/lib/auth-api';
import * as userApi from '@/lib/user-api';

export const useAuth = () => {
  const { 
    user,
    isLoading,
    isLoggingIn,
    setUser,
    setLoading,
    setLoggingIn,
    reset 
  } = useAuthStore();
  const resetChats = useChatStore((s) => s.reset);
  const resetMessages = useMessageStore((s) => s.reset);

  const isAuthenticated = !!user;

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await userApi.getProfile();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoggingIn(true);
      try {
        await authApi.signin({ email, password });
        await fetchUser();
      } catch (error) {
        setUser(null);
        setLoggingIn(false);
        throw error;
      }
    },
    [setUser, setLoggingIn, fetchUser]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
      reset();
      resetChats();
      resetMessages();
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, reset, resetChats, resetMessages]);

  const refresh = useCallback(async () => {
    try {
      await authApi.refresh();
      await fetchUser();
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, [fetchUser, setUser]);

  const signupAndLogin = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      await authApi.signup({ first_name: firstName, last_name: lastName, email, password });
      await login(email, password);
    },
    [login]
  );

  return {
    user,
    isLoading,
    isLoggingIn,
    isAuthenticated,
    login,
    logout,
    refresh,
    signup: signupAndLogin,
    refetch: fetchUser,
  };
};