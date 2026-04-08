"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { user, refetch, logout, isLoading } = useAuth()

  useEffect(() => {
    refetch()
  }, [refetch])

  if (isLoading) {
    return <div className="p-6">Загрузка...</div>
  }

  if (!user) {
    return <div className="p-6">Пользователь не найден</div>
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Главная</h1>

      <div className="space-y-2">
        <p><b>ID:</b> {user.id}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Имя:</b> {user.first_name}</p>
        <p><b>Фамилия:</b> {user.last_name}</p>
        <p><b>Роль:</b> {user.role}</p>
      </div>

      <Button onClick={logout}>
        Выйти
      </Button>
    </div>
  )
}