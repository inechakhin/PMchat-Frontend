"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import * as userApi from "@/lib/user-api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, isLoading } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      if (!isLoading) {
        setLoading(true);
      }

      try {
        const userData = await userApi.getProfile();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading, isLoading]);

  return <>{children}</>;
}