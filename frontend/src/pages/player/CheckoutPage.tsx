import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { createVNPayUrl } from "@/features/payment/api/paymentApi";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Expecting booking details passed via location.state
  const bookingData = location.state?.bookingData || null;

  if (!bookingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-bold">Không tìm thấy thông tin thanh toán</h2>
        <Button onClick={() => navigate("/booking")}>Quay lại đặt sân</Button>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const url = await createVNPayUrl(bookingData.bookingId, bookingData.totalPrice);
      window.location.href = url; // Redirect to VNPay
    } catch (error) {
      console.error("Lỗi khi tạo payment URL", error);
      toast.error("Không thể tạo kết nối thanh toán. Vui lòng thử lại!");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
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
          <div className="flex justify-between pt-2">
            <span className="text-lg font-bold text-gray-800">Tổng tiền:</span>
            <span className="text-xl font-bold text-[#1a5f7a]">
              {bookingData.totalPrice?.toLocaleString('vi-VN')} VNĐ
            </span>
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
