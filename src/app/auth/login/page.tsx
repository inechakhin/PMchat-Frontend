import Link from "next/link"
import { LoginForm } from "@/components/forms/login-form"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-center text-2xl font-semibold">Вход</h1>

      <LoginForm />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Нет аккаунта?{" "}
        <Link href="auth/register" className="font-medium text-blue-600 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}