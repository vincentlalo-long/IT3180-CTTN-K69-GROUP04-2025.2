import { useCallback, useEffect, useState } from "react";

import { useVenueContext as useFacilityContext } from "../../venue/hooks/useVenueContext";
import {
  fetchOrdersByVenue,
  updateOrderStatusApi,
  type AdminBookingSummaryResponse,
} from "../api/bookingApi";

export function useOrderManagement() {
  const {
    selectedVenue: selectedFacility,
    selectedVenueId: selectedFacilityId,
  } = useFacilityContext();

  const [orders, setOrders] = useState<AdminBookingSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrdersByVenue(selectedFacilityId);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFacilityId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleConfirmDeposit = async (orderId: number) => {
    try {
      await updateOrderStatusApi(orderId, "CONFIRMED", "Xác nhận cọc");
      await loadOrders();
    } catch (error) {
      console.error("Failed to confirm deposit:", error);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await updateOrderStatusApi(orderId, "CANCELLED", "Hủy đơn");
      await loadOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  return {
    visibleOrders: orders,
    handleConfirmDeposit,
    handleCancelOrder,
    selectedFacilityId,
    selectedFacility,
    isLoading,
  };
}
