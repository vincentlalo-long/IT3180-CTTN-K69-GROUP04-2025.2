import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/apiClient";
import type { PlayerProfileInfo } from "../types/account.types";

// Giữ các stubs sự kiện để tránh lỗi biên dịch nếu có chỗ chưa cập nhật
export function emitProfileEvent() {}
export function subscribeProfileEvent() {
  return () => {};
}

export function usePlayerProfile() {
  const {
    data: userInfo,
    isLoading: loadingUser,
    error,
    refetch,
  } = useQuery<PlayerProfileInfo>({
    queryKey: ["playerProfile"],
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
        createdAt: dto.createdAt,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const userError =
    error instanceof Error ? error.message : error ? String(error) : null;

  return { userInfo, loadingUser, userError, refetch };
}
