import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/apiClient";
import type { PlayerProfileInfo } from "../types/account.types";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

// Giữ các stubs sự kiện để tránh lỗi biên dịch nếu có chỗ chưa cập nhật
export function emitProfileEvent() {}
export function subscribeProfileEvent() {
  return () => {};
}

export function usePlayerProfile() {
  const { user } = useAuthContext();

  const {
    data: userInfo,
    isLoading: loadingUser,
    error,
    refetch,
  } = useQuery<PlayerProfileInfo>({
    queryKey: ["playerProfile", user?.email],
    queryFn: async () => {
      const res = await apiClient.get("/users/me");
      const dto = res.data;
      return {
        id: dto.id,
        username: dto.username,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        avatarUrl: dto.avatarUrl,
        role: dto.role,
        teamId: dto.teamId,
        membershipPoints: dto.membershipPoints ?? 0,
        walletBalance: dto.walletBalance ?? 0,
        createdAt: dto.createdAt,
      };
    },
    enabled: !!user?.token,
    staleTime: 5 * 60 * 1000,
  });

  const userError =
    error instanceof Error ? error.message : error ? String(error) : null;

  return { userInfo, loadingUser, userError, refetch };
}
