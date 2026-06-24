import { apiClient } from "@/shared/api/apiClient";
import type { ActivityLogResponse } from "../types/activitylog.types";

export async function getActivityLogs(
  page: number,
  size = 10,
): Promise<ActivityLogResponse> {
  const { data } = await apiClient.get<ActivityLogResponse>(
    "/admin/activity-logs",
    {
      params: {
        page,
        size,
        sort: "id,desc",
      },
    },
  );
  return data;
}
