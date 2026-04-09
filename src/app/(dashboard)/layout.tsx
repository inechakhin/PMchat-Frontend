"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Пока идёт загрузка – показываем индикатор
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  // Если не аутентифицирован – ничего не рендерим, ждём редиректа
  if (!isAuthenticated) {
    return null;
  }

  // Всё хорошо – отображаем страницу
  return <>{children}</>;
}