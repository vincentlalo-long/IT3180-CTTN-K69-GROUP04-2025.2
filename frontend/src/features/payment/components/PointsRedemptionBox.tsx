import { Gift } from "lucide-react";

interface PointsRedemptionBoxProps {
  availablePoints: number;
  originalAmount: number;
  pointsToUse: number;
  onPointsChange: (points: number) => void;
  disabled?: boolean;
}

const POINT_VALUE = 100;

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("vi-VN") + " VNĐ";

export function PointsRedemptionBox({
  availablePoints,
  originalAmount,
  pointsToUse,
  onPointsChange,
  disabled = false,
}: PointsRedemptionBoxProps) {
  const maxPointsByAmount = Math.max(0, Math.ceil(originalAmount / POINT_VALUE) - 1);
  const maxRedeemablePoints = Math.min(availablePoints, maxPointsByAmount);
  const discountAmount = Math.min(pointsToUse * POINT_VALUE, originalAmount);

  const handleInputChange = (value: string) => {
    const normalizedValue = value.replace(/[^\d]/g, "");
    const nextPoints = normalizedValue ? Number(normalizedValue) : 0;
    onPointsChange(Math.min(nextPoints, maxRedeemablePoints));
  };

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-emerald-800">
        <Gift className="h-5 w-5" />
        <h2 className="text-base font-bold">Sử dụng điểm thành viên</h2>
      </div>

      <div className="grid gap-3 border-y border-emerald-100 py-3 text-sm text-gray-700 sm:grid-cols-2">
        <div>
          <p className="text-gray-500">Điểm hiện có</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {availablePoints.toLocaleString("vi-VN")} điểm
          </p>
        </div>
        <div>
          <p className="text-gray-500">Tỷ lệ quy đổi</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            100 điểm = 10.000 VNĐ
          </p>
        </div>
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-700">
        Nhập số điểm muốn dùng
        <input
          type="text"
          inputMode="numeric"
          value={pointsToUse || ""}
          onChange={(event) => handleInputChange(event.target.value)}
          disabled={disabled || maxRedeemablePoints === 0}
          placeholder="0"
          className="mt-2 h-11 w-full rounded-md border border-emerald-200 bg-white px-3 text-base font-semibold text-gray-900 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </label>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>Tối đa: {maxRedeemablePoints.toLocaleString("vi-VN")} điểm</span>
        <button
          type="button"
          onClick={() => onPointsChange(maxRedeemablePoints)}
          disabled={disabled || maxRedeemablePoints === 0}
          className="font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Dùng tối đa
        </button>
      </div>

      {pointsToUse > 0 ? (
        <div className="mt-4 rounded-md border border-emerald-100 bg-white px-3 py-2 text-sm text-gray-700">
          Giảm giá:{" "}
          <span className="font-bold text-emerald-700">
            {formatCurrency(discountAmount)}
          </span>
        </div>
      ) : null}
    </section>
  );
}
