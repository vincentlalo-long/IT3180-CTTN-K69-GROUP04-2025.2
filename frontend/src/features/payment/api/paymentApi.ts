import apiClient from "@/shared/api/apiClient";
import { logApiError } from "@/shared/utils/apiError";

/**
 * POST /payment/vnpay/create-url
 * Request body: { bookingId: number, amount: number, pointsToUse: number }
 */
interface CreatePaymentResult {
  paymentUrl: string;
  payableAmount: number;
  discountAmount: number;
  pointsUsed: number;
}

export const createVNPayUrl = async (
  bookingId: number,
  amount: number,
  pointsToUse = 0,
): Promise<CreatePaymentResult> => {
  try {
    const response = await apiClient.post<CreatePaymentResult>(
      "/payment/vnpay/create-url",
      { bookingId, amount, pointsToUse }
    );
    return response.data;
  } catch (error) {
    logApiError("createVNPayUrl", error, { bookingId, amount, pointsToUse });
    throw error;
  }
};

export const confirmVNPayReturn = async (
  params: Record<string, string>,
): Promise<void> => {
  try {
    await apiClient.post("/payment/vnpay/confirm-return", params);
  } catch (error) {
    logApiError("confirmVNPayReturn", error, params);
    throw error;
  }
};
