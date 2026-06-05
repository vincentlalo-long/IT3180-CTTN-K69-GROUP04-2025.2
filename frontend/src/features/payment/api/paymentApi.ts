import apiClient from "@/shared/api/apiClient";
import { logApiError } from "@/shared/utils/apiError";

/**
 * POST /payment/vnpay/create-url
 * Request body: { bookingId: number, amount: number }
 * Response:     { paymentUrl: string }
 */
export const createVNPayUrl = async (
  bookingId: number,
  amount: number
): Promise<string> => {
  try {
    const response = await apiClient.post<{ paymentUrl: string }>(
      "/payment/vnpay/create-url",
      { bookingId, amount }
    );
    return response.data.paymentUrl;
  } catch (error) {
    logApiError("createVNPayUrl", error, { bookingId, amount });
    throw error;
  }
};
