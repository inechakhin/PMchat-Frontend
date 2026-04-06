import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { ErrorDto } from "@/types/types"

const isBrowser = typeof window !== "undefined"

export const apiClient = axios.create({
  baseURL: isBrowser ? "" : process.env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorDto>) => {
    const status = error.response?.status
    const originalRequest = error.config as RetryRequestConfig

    if (!isBrowser) {
      return Promise.reject(error)
    }

    if (status === 401) {
      if (originalRequest?._retry) {
        await logout()
        window.location.href = "/api/auth/signin"
        return Promise.reject(error)
      }

      if (originalRequest?.url?.includes("/api/auth/refresh")) {
        await logout()
        window.location.href = "/api/auth/signin"
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await apiClient.post("/api/auth/refresh")
        return apiClient(originalRequest)
      } catch (refreshError) {
        await logout()
        window.location.href = "/api/auth/signin"
        return Promise.reject(refreshError)
      }
    }

    if (status === 403) {
      window.location.href = "/errors/forbidden"
    }

    if (status && status >= 500) {
      window.location.href = "/errors/server"
    }

    return Promise.reject(error)
  }
)

export async function logout() {
  try {
    await apiClient.post("/api/auth/logout")
  } catch {}
}