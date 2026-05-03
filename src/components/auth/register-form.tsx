"use client"

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth-store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "Введите имя"),
    lastName: z.string().min(1, "Введите фамилию"),
    email: z.email("Неверный email"),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  const router = useRouter();
  
  const { signup } = useAuth();
  
  const isLoggingIn = useAuthStore((s) => s.isLoggingIn);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signup(
        data.firstName,
        data.lastName,
        data.email,
        data.password
      )
      router.push("/")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Имя"
        id="firstName"
        error={errors.firstName?.message}
        {...register("firstName")}
      />

      <FormField
        label="Фамилия"
        id="lastName"
        error={errors.lastName?.message}
        {...register("lastName")}
      />

      <FormField
        label="Email"
        id="email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormField
        label="Пароль"
        id="password"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />

      <FormField
        label="Повторите пароль"
        id="confirmPassword"
        type="password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" className="w-full" isLoading={isLoggingIn}>
        Зарегистрироваться
      </Button>
    </form>
  )
}