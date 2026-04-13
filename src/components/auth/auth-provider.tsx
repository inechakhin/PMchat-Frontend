"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, refetch } = useAuth();
  const router = useRouter();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && !isAuthenticated) {
      hasInitialized.current = true;
      refetch();
    }
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}