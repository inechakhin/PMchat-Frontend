"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

export const loginSchema = z.object({
  email: z.email("Неверный email"),
  password: z.string().min(6, "Минимум 6 символов"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
  const { login, isLoggingIn } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      router.push("/")
    } catch (e: any) {
      console.error(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        id="email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormField
        label="Password"
        id="password"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" className="w-full" isLoading={isLoggingIn}>
        Войти
      </Button>
    </form>
  )
}