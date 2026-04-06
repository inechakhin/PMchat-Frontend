"use client"

import { useRouter } from "next/navigation"

export default function ServerErrorPage() {
  const router = useRouter()

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">500</h1>

        <h2 className="text-xl font-semibold mb-2">
          Ошибка сервера
        </h2>

        <p className="text-sm opacity-70 mb-6">
          Что-то пошло не так. Пожайлуйста, попробуйте снова позже.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            Повторить
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg border"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  )
}