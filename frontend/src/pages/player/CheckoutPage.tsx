import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { createVNPayUrl } from "@/features/payment/api/paymentApi";
import { PointsRedemptionBox } from "@/features/payment/components/PointsRedemptionBox";
import { usePlayerProfile } from "@/features/account/hooks/usePlayerProfile";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { cancelUnpaidBooking } from "@/features/booking/api/bookingApi";

const POINT_VALUE = 100;

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return 0;
};

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("vi-VN") + " VNĐ";

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const { userInfo, loadingUser } = usePlayerProfile();

  // Expecting booking details passed via location.state
  const bookingData = location.state?.bookingData || null;
  const totalPrice = toNumber(bookingData?.totalPrice);
  const depositAmount = totalPrice * 0.5; // Chỉ thanh toán 50% tiền cọc
  const availablePoints = userInfo?.membershipPoints ?? 0;
  const maxPointsByAmount = Math.max(0, Math.ceil(depositAmount / POINT_VALUE) - 1);
  const maxRedeemablePoints = Math.min(availablePoints, maxPointsByAmount);
  const safePointsToUse = Math.min(pointsToUse, maxRedeemablePoints);
  const discountAmount = safePointsToUse * POINT_VALUE;
  const payableAmount = Math.max(0, depositAmount - discountAmount);

  if (!bookingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-bold">Không tìm thấy thông tin thanh toán</h2>
        <Button onClick={() => navigate("/booking")}>Quay lại đặt sân</Button>
      </div>
    );
  }

  const handleGoBack = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await cancelUnpaidBooking(bookingData.bookingId);
    } catch (error) {
      console.error("Lỗi khi hủy đơn đặt sân", error);
    } finally {
      setIsLoading(false);
      navigate("/booking");
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const payment = await createVNPayUrl(
        bookingData.bookingId,
        depositAmount,
        safePointsToUse,
      );
      window.location.href = payment.paymentUrl; // Redirect to VNPay
    } catch (error) {
      console.error("Lỗi khi tạo payment URL", error);
      toast.error("Không thể tạo kết nối thanh toán. Vui lòng thử lại!");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <button
        onClick={handleGoBack}
        disabled={isLoading}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Quay lại
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center border-b pb-4 text-gray-900">Thanh Toán Đơn Đặt Sân</h1>

        {bookingData.recurringWarning && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="whitespace-pre-line">{bookingData.recurringWarning}</span>
          </div>
        )}

        {bookingData.recurringSummary && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            <div>{bookingData.recurringSummary}</div>
            {bookingData.createdCount && (
              <div className="mt-1 text-emerald-700">
                Tạo {bookingData.createdCount} lịch
                {bookingData.skippedCount ? `, bỏ qua ${bookingData.skippedCount}` : ""}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-600">Sân bóng:</span>
            <span className="font-semibold text-gray-900">{bookingData.pitchName || "Sân chưa xác định"}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-600">Ngày đặt:</span>
            <span className="font-semibold text-gray-900">{bookingData.bookingDate}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-600">Giờ chơi:</span>
            <span className="font-semibold text-gray-900">{bookingData.startTime} - {bookingData.endTime}</span>
          </div>
          <PointsRedemptionBox
            availablePoints={availablePoints}
            originalAmount={depositAmount}
            pointsToUse={safePointsToUse}
            onPointsChange={setPointsToUse}
            disabled={loadingUser || isLoading}
          />

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tổng tiền sân:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
              <span>Tiền cọc cần trả (50%):</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(depositAmount)}
              </span>
            </div>
            {safePointsToUse > 0 ? (
              <div className="flex justify-between text-sm text-emerald-700">
                <span>Giảm bằng điểm:</span>
                <span className="font-semibold">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-lg font-bold text-gray-800">
                Tiền đặt cọc VNPay:
              </span>
              <span className="text-xl font-bold text-[#1a5f7a]">
                {formatCurrency(payableAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-xs text-gray-500">
              <span>Còn lại (thanh toán tại sân sau khi đá):</span>
              <span>{formatCurrency(totalPrice - depositAmount)}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang kết nối VNPay...
            </>
          ) : (
            "Thanh toán qua VNPay"
          )}
        </Button>
      </div>
    </div>
  );
};
