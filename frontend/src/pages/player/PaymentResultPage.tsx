
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Home, Calendar } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { confirmVNPayReturn } from "@/features/payment/api/paymentApi";

export const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirmError, setConfirmError] = useState<string | null>(null);
  
  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef");
  const amountStr = searchParams.get("vnp_Amount");
  const returnParams = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );
  
  const isSuccess = responseCode === "00";
  const amount = amountStr ? (parseInt(amountStr, 10) / 100).toLocaleString('vi-VN') : "0";

  useEffect(() => {
    if (!isSuccess || !txnRef) {
      return;
    }

    void confirmVNPayReturn(returnParams).catch((error) => {
      console.error("Không thể xác nhận thanh toán VNPay", error);
      setConfirmError("Thanh toán thành công nhưng chưa thể cập nhật điểm thành viên. Vui lòng liên hệ quản trị viên.");
    });
  }, [isSuccess, returnParams, txnRef]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full text-center">
        {isSuccess ? (
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>
        )}
        
        <h1 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess ? "Thanh Toán Thành Công!" : "Thanh Toán Thất Bại"}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {isSuccess 
            ? "Cảm ơn bạn đã đặt sân. Đơn đặt sân của bạn đã được xác nhận và thanh toán thành công."
            : "Rất tiếc, giao dịch của bạn không thể hoàn tất hoặc đã bị hủy. Vui lòng thử lại sau."}
        </p>

        {isSuccess && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2 text-sm border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-medium">{txnRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số tiền:</span>
              <span className="font-medium text-[#1a5f7a]">{amount} VNĐ</span>
            </div>
          </div>
        )}

        {confirmError && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {confirmError}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isSuccess ? (
            <Button onClick={() => navigate("/profile")} className="w-full flex items-center justify-center">
              <Calendar className="w-4 h-4 mr-2" />
              Xem lịch sử đặt sân
            </Button>
          ) : (
            <Button onClick={() => navigate("/booking")} className="w-full flex items-center justify-center">
              Thử lại đặt sân
            </Button>
          )}
          
          <Link 
            to="/" 
            className="flex items-center justify-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
