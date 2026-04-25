import { useMemo, useState } from "react";

import {
  ALL_FACILITIES_ID,
  mockOrders,
  type Order,
} from "../../../data/mockAdminData";
import { useVenueContext as useFacilityContext } from "../../venue/hooks/useVenueContext";

export function useOrderManagement() {
  const {
    selectedVenue: selectedFacility,
    selectedVenueId: selectedFacilityId,
  } = useFacilityContext();
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const visibleOrders = useMemo(
    () =>
      selectedFacilityId === ALL_FACILITIES_ID
        ? orders
        : orders.filter((order) => order.facilityId === selectedFacilityId),
    [orders, selectedFacilityId],
  );

  const handleConfirmDeposit = (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Đã cọc" } : order,
      ),
    );
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Đã hủy" } : order,
      ),
    );
  };

  return {
    visibleOrders,
    handleConfirmDeposit,
    handleCancelOrder,
    selectedFacilityId,
    selectedFacility,
  };
}
