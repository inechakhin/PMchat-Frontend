import Link from "next/link"
import { RegisterForm } from "@/components/forms/register-form"

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-center text-2xl font-semibold">Регистрация</h1>

      <RegisterForm />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Уже есть аккаунт?{" "}
        <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}