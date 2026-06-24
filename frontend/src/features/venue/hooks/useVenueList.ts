import { useEffect, useState } from "react";
import logoFootball from "../../../assets/images/logo-ball.jpg";
import { getVenues } from "../api/venueApi";
import type { VenueItem } from "../types/venue.types";
import { getApiErrorMessage } from "@/shared/utils/apiError";

export function useVenueList() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getVenues();
        if (isMounted) {
          const transformedVenues: VenueItem[] = data.map((v) => ({
            id: v.id,
            name: v.name,
            address: v.address,
            imageUrl: v.imageUrl,
            ballLogoUrl: logoFootball,
            openTime: "Giờ mở cửa: Cả ngày", // Default value as it's not in the simple DTO
            minPrice: typeof v.minPrice === "string" ? parseFloat(v.minPrice) : v.minPrice,
            latitude: v.latitude,
            longitude: v.longitude,
            averageRating: v.averageRating,
            reviewCount: v.reviewCount,
          }));
          setVenues(transformedVenues);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Không thể tải danh sách sân."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVenues();

    return () => {
      isMounted = false;
    };
  }, []);

  return { venues, isLoading, error };
}
