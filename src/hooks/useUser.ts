import { useAuthStore } from '@/store/auth-store';
import * as userApi from '@/lib/user-api';
import { UpdateProfileRequest } from '@/types/types';

export const useUser = () => {
  const { user, setUser } = useAuthStore();

  const updateProfile = async (data: UpdateProfileRequest) => {
    const updated = await userApi.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    await userApi.deleteProfile();
    setUser(null);
  };

  return {
    user,
    updateProfile,
    deleteAccount,
  };
};