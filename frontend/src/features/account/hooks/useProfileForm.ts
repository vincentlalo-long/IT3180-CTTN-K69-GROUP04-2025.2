import { useState, useEffect, type FormEvent } from "react";
import apiClient from "@/shared/api/apiClient";
import type { ProfileFormData } from "../types/profile.types";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import { toast } from "../../../shared/utils/toast";
import { useAuthContext } from "../../auth/hooks/useAuthContext";

export function useProfileForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [adminInfo, setAdminInfo] = useState<{
    role: string;
    createdAt: string;
    avatarUrl: string | null;
  } | null>(null);

  const { user, setUser } = useAuthContext();

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/users/me");
      const data = response.data;
      setProfileForm({
        fullName: data.username || "",
        email: data.email || "",
        phone: data.phoneNumber || "",
      });
      setAdminInfo({
        role: data.role || "ADMIN",
        createdAt: data.createdAt || "",
        avatarUrl: data.avatarUrl || null,
      });
    } catch (err) {
      logApiError("useProfileForm.fetchProfile", err);
      setError(getApiErrorMessage(err, "Không thể tải thông tin tài khoản."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfileField = <Key extends keyof ProfileFormData>(
    key: Key,
    value: ProfileFormData[Key],
  ) => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await apiClient.patch("/users/me", {
        username: profileForm.fullName,
        phoneNumber: profileForm.phone,
      });
      const data = response.data;
      toast.success("Cập nhật thông tin thành công!");
      
      // Update global context user state to synchronize name in TopBar immediately
      setUser({
        ...user,
        username: data.username,
      });
    } catch (err) {
      logApiError("useProfileForm.handleSubmit", err);
      toast.error(getApiErrorMessage(err, "Lỗi khi cập nhật thông tin!"));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isLoading,
    error,
    profileForm,
    adminInfo,
    handleSubmit,
    updateProfileField,
    refetch: fetchProfile,
  };
}