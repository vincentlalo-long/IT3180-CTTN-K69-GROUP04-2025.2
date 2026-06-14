import { useCallback, useEffect, useState } from "react";
import {
  X,
  Receipt,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  CreditCard,
  Banknote,
} from "lucide-react";

import {
  fetchBookingDetail,
  fetchAvailableServicesForBooking,
  settleBookingApi,
  type AdminBookingDetailResponse,
  type VenueServiceItem,
} from "../../api/bookingApi";
import { formatCompactPrice } from "../../utils/booking.utils";

interface SettleInvoiceModalProps {
  bookingId: number;
  venueName: string;
  onClose: () => void;
  onSettled: () => void;
}

interface SelectedService {
  serviceId: number;
  name: string;
  price: number;
  unit: string | null;
  quantity: number;
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function SettleInvoiceModal({
  bookingId,
  venueName,
  onClose,
  onSettled,
}: SettleInvoiceModalProps) {
  const [detail, setDetail] = useState<AdminBookingDetailResponse | null>(null);
  const [availableServices, setAvailableServices] = useState<
    VenueServiceItem[]
  >([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingDetail, services] = await Promise.all([
        fetchBookingDetail(bookingId),
        fetchAvailableServicesForBooking(bookingId).catch(
          () => [] as VenueServiceItem[],
        ),
      ]);
      setDetail(bookingDetail);
      setAvailableServices(services);
    } catch (err) {
      console.error("Failed to load booking detail:", err);
      setError("Không thể tải thông tin đơn đặt sân.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddService = (service: VenueServiceItem) => {
    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.serviceId === service.id);
      if (existing) {
        return prev.map((s) =>
          s.serviceId === service.id ? { ...s, quantity: s.quantity + 1 } : s,
        );
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          name: service.name,
          price: service.price,
          unit: service.unit,
          quantity: 1,
        },
      ];
    });
  };

  const handleChangeQuantity = (serviceId: number, delta: number) => {
    setSelectedServices((prev) =>
      prev
        .map((s) =>
          s.serviceId === serviceId
            ? { ...s, quantity: Math.max(0, s.quantity + delta) }
            : s,
        )
        .filter((s) => s.quantity > 0),
    );
  };

  const handleSubmit = async () => {
    if (!detail) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await settleBookingApi(bookingId, {
        services: selectedServices.map((s) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
        })),
        paymentMethod,
        adminNote,
      });
      setSuccess(true);
      setTimeout(() => {
        onSettled();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to settle booking:", err);
      setError("Không thể chốt hóa đơn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!detail && !isLoading) return null;

  const fieldPrice = detail?.totalPrice ?? 0;
  const existingServicesTotal =
    detail?.addOns?.reduce(
      (sum, addon) => sum + addon.price * addon.quantity,
      0,
    ) ?? 0;
  const newServicesTotal = selectedServices.reduce(
    (sum, s) => sum + s.price * s.quantity,
    0,
  );
  const totalBill = fieldPrice + newServicesTotal;
  const depositPaid = detail?.depositAmount ?? 0;
  const remainingBalance = Math.max(0, totalBill - depositPaid);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-b from-[#004f27] to-[#003d1e] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#004f27]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Receipt size={20} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Chốt hóa đơn #{bookingId}
              </h2>
              <p className="text-xs text-white/60">{venueName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-white/70">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">
              Đang tải thông tin đơn...
            </span>
          </div>
        ) : (
          <div className="space-y-5 px-6 py-5">
            {/* Customer & Booking Info */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Khách hàng
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {detail?.customerName}
                  </p>
                  <p className="text-xs text-white/60">
                    {detail?.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Sân & Ca đá
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {detail?.pitchName}
                  </p>
                  <p className="text-xs text-white/60">
                    {detail
                      ? `${formatTime(detail.startTime)} - ${formatTime(detail.endTime)}, ${formatDate(detail.bookingDate)}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Services */}
            {detail?.addOns && detail.addOns.length > 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
                  🧾 Dịch vụ đã chọn khi đặt
                </p>
                <div className="space-y-2">
                  {detail.addOns.map((addon, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm text-white/80"
                    >
                      <span>
                        {addon.serviceName} ×{addon.quantity}
                      </span>
                      <span className="font-medium text-white">
                        {formatCompactPrice(addon.price * addon.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Add New Services */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
                🥤 Dịch vụ phát sinh khi đá sân
              </p>

              {availableServices.length > 0 ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {availableServices
                    .filter(
                      (s) =>
                        !selectedServices.some(
                          (ss) => ss.serviceId === s.id,
                        ),
                    )
                    .map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleAddService(service)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-emerald-500/20 hover:text-emerald-200"
                      >
                        <Plus size={14} />
                        {service.name} —{" "}
                        {formatCompactPrice(service.price)}
                        {service.unit ? `/${service.unit}` : ""}
                      </button>
                    ))}
                </div>
              ) : (
                <p className="mb-3 text-xs italic text-white/40">
                  Chưa có dịch vụ nào trong cụm sân này.
                </p>
              )}

              {selectedServices.length > 0 ? (
                <div className="space-y-2 border-t border-white/10 pt-3">
                  {selectedServices.map((service) => (
                    <div
                      key={service.serviceId}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-white">
                        {service.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleChangeQuantity(service.serviceId, -1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/20 text-white/70 transition hover:bg-white/10"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[24px] text-center text-sm font-bold text-white">
                          {service.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleChangeQuantity(service.serviceId, 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/20 text-white/70 transition hover:bg-white/10"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="min-w-[80px] text-right text-sm font-semibold text-emerald-200">
                          {formatCompactPrice(
                            service.price * service.quantity,
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Bill Summary */}
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-900/30 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-200/70">
                💵 Chi tiết thanh toán
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Tiền sân gốc{existingServicesTotal > 0 ? " + dịch vụ ban đầu" : ""}</span>
                  <span className="font-medium text-white">
                    {formatCompactPrice(fieldPrice)}
                  </span>
                </div>
                {newServicesTotal > 0 ? (
                  <div className="flex justify-between text-white/80">
                    <span>Dịch vụ phát sinh</span>
                    <span className="font-medium text-emerald-200">
                      +{formatCompactPrice(newServicesTotal)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-white/10 pt-2 text-white/80">
                  <span>Tổng hóa đơn thực tế</span>
                  <span className="font-bold text-white">
                    {formatCompactPrice(totalBill)}
                  </span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Đã thanh toán cọc (online)</span>
                  <span className="font-medium text-lime-200">
                    -{formatCompactPrice(depositPaid)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-emerald-400/20 pt-2">
                  <span className="text-base font-bold text-white">
                    Số tiền còn phải thu
                  </span>
                  <span className="text-base font-extrabold text-emerald-300">
                    {formatCompactPrice(remainingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
                Phương thức thu nốt
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    paymentMethod === "CASH"
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <Banknote size={18} />
                  Tiền mặt
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    paymentMethod === "TRANSFER"
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <CreditCard size={18} />
                  Chuyển khoản
                </button>
              </div>
            </div>

            {/* Admin Note */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
                Ghi chú
              </p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ghi chú thêm (tùy chọn)..."
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/50"
                rows={2}
              />
            </div>

            {/* Error / Success */}
            {error ? (
              <div className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-200">
                <CheckCircle2 size={18} />
                Chốt hóa đơn thành công! Đơn đã chuyển sang Hoàn thành.
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || success}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Thanh toán & Hoàn thành
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
