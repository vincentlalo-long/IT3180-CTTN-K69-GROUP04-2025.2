import { useState } from "react";

import fieldImage from "../../../assets/images/Old_Trafford.jpg";
import logoFootball from "../../../assets/images/logo-ball.jpg";
import type { VenueItem } from "../types/venue.types";

const initialVenues: VenueItem[] = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  imageUrl: fieldImage,
  ballLogoUrl: logoFootball,
  name: "SÂN BÓNG ĐỀN LỪ 3",
  address: "P. Tân Mai, Hoàng Văn Thụ, Hoàng Mai, Hà Nội",
  openTime: "Giờ mở cửa: Cả ngày",
}));

export function useVenueList() {
  const [venues] = useState<VenueItem[]>(initialVenues);
  const [isLoading] = useState(false);

  return { venues, isLoading };
}
