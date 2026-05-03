import {
  User,
  UpdateProfileRequest,
} from "@/types/types"
import { apiClient } from "@/utils/axios"

export async function getProfile(): Promise<User> {
  const res = await apiClient.get<User>("/api/users/profile")
  return res.data
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const res = await apiClient.patch<User>("/api/users/profile", data)
  return res.data
}

export async function deleteProfile(): Promise<void> {
  await apiClient.delete("/api/users/profile")
}