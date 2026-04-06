"use client"

import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {}, []) 

  return (
    <main>
      <h1>Главная страница</h1>
      <p>Код в useEffect выполнится в браузере после загрузки страницы.</p>
    </main>
  )
}