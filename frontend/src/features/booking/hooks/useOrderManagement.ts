import { useCallback, useEffect, useState } from "react";

import { useVenueContext as useFacilityContext } from "../../venue/hooks/useVenueContext";
import {
  fetchOrdersByVenue,
  updateOrderStatusApi,
  type AdminBookingSummaryResponse,
} from "../api/bookingApi";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";

export function useOrderManagement() {
  const {
    selectedVenue: selectedFacility,
    selectedVenueId: selectedFacilityId,
  } = useFacilityContext();

  const [orders, setOrders] = useState<AdminBookingSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchOrdersByVenue(selectedFacilityId);
      setOrders(data);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể tải danh sách đơn đặt sân.",
      );
      setErrorMessage(message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFacilityId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleConfirmDeposit = async (orderId: number) => {
    setErrorMessage(null);
    try {
      await updateOrderStatusApi(orderId, "BOOKED", "Xác nhận cọc");
      await loadOrders();
    } catch (error) {
      logApiError("useOrderManagement.handleConfirmDeposit", error, {
        orderId,
      });
      setErrorMessage(getApiErrorMessage(error, "Không thể xác nhận cọc."));
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setErrorMessage(null);
    try {
      await updateOrderStatusApi(orderId, "CANCELLED", "Hủy đơn");
      await loadOrders();
    } catch (error) {
      logApiError("useOrderManagement.handleCancelOrder", error, {
        orderId,
      });
      setErrorMessage(getApiErrorMessage(error, "Không thể hủy đơn đặt sân."));
    }
  };

  return {
    visibleOrders: orders,
    handleConfirmDeposit,
    handleCancelOrder,
    selectedFacilityId,
    selectedFacility,
    isLoading,
    errorMessage,
  };
}
