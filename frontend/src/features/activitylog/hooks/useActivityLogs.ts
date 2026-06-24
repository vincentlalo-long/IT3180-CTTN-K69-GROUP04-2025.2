import { useEffect, useState } from "react";

import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import { getActivityLogs } from "../api/activityLogApi";
import type { ActivityLogDto } from "../types/activitylog.types";

export function useActivityLogs(initialPage = 0, size = 10) {
  const [logs, setLogs] = useState<ActivityLogDto[]>([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getActivityLogs(page, size);
        if (isActive) {
          setLogs(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        }
      } catch (err) {
        if (isActive) {
          const message = getApiErrorMessage(
            err,
            "Không thể tải nhật ký hoạt động",
          );
          logApiError("useActivityLogs.fetchLogs", err, { page, size });
          setError(message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchLogs();

    return () => {
      isActive = false;
    };
  }, [page, size]);

  return {
    logs,
    page,
    setPage,
    totalPages,
    totalElements,
    isLoading,
    error,
  };
}
