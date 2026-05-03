import {
    SignUpRequest,
    SignInRequest,
    AuthStatusResponse,
} from "@/types/types"
import { apiClient } from "@/utils/axios"

export async function signup(data: SignUpRequest): Promise<void> {
  await apiClient.post("/api/auth/signup", data)
}

export async function signin(data: SignInRequest): Promise<AuthStatusResponse> {
  const res = await apiClient.post<AuthStatusResponse>("/api/auth/signin", data)
  return res.data
}

export async function refresh(): Promise<AuthStatusResponse> {
  const res = await apiClient.post<AuthStatusResponse>("/api/auth/refresh")
  return res.data
}

export async function logout(): Promise<void> {
  await apiClient.post("/api/auth/logout")
}