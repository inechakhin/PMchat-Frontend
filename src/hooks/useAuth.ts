import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import * as authApi from '@/lib/auth-api';
import * as userApi from '@/lib/user-api';

export const useAuth = () => {

  const fetchUser = useCallback(async () => {
    const { setUser, setLoading } = useAuthStore.getState();
    setLoading(true);
    try {
      const userData = await userApi.getProfile();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { setUser, setLoggingIn } = useAuthStore.getState();
    setLoggingIn(true);
    try {
      await authApi.signin({ email, password });
      await fetchUser();
    } catch (error) {
      setUser(null);
      setLoggingIn(false);
      throw error;
    }
  }, [fetchUser]);

  const logout = useCallback(async () => {
    const { setLoading, reset } = useAuthStore.getState();
    setLoading(true);
    try {
      await authApi.logout();
      reset();
      useChatStore.getState().reset();
      useMessageStore.getState().reset();
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signupAndLogin = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      await authApi.signup({ first_name: firstName, last_name: lastName, email, password });
      await login(email, password);
    },
    [login]
  );

  return {
    login,
    logout,
    signup: signupAndLogin,
    refetch: fetchUser,
  };
};