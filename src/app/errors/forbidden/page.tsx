"use client"

import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">403</h1>

        <h2 className="text-xl font-semibold mb-2">
          Доступ запрещен
        </h2>

        <p className="text-sm opacity-70 mb-6">
          Вы не имеете прав доступа к этому ресурсу.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}