import { ALL_FACILITIES_ID } from "../../features/booking/constants/booking.constants";
import { FieldScheduleTable, useFieldSchedule } from "../../features/booking";

export function FieldSchedulePage() {
  const {
    fieldScheduleRows,
    handleClickSlot,
    selectedFacility,
    selectedFacilityId,
    selectedDate,
    setSelectedDate,
    isLoading,
    error,
  } = useFieldSchedule();

  const isAllFacilitiesSelected = selectedFacilityId === ALL_FACILITIES_ID;
  const shouldShowLoadingState = isLoading && fieldScheduleRows.length === 0;
  const shouldShowErrorState = !isLoading && Boolean(error);
  const shouldShowEmptyState =
    !isLoading && !error && fieldScheduleRows.length === 0;
  const shouldShowTable = !isLoading && !error && fieldScheduleRows.length > 0;

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-white">Quản lý lịch sân</h2>
          <p className="mt-1 text-sm text-white/80">
            {isAllFacilitiesSelected
              ? "Đang hiển thị lịch của toàn bộ khu sân trong hệ thống."
              : `Đang hiển thị lịch của ${selectedFacility?.name}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-medium text-white/90">
              Trống
            </span>
            <span className="rounded-full border border-amber-100/70 bg-amber-300/30 px-3 py-1 text-xs font-medium text-amber-50">
              Đã cọc
            </span>
            <span className="rounded-full border border-slate-200/45 bg-white/12 px-3 py-1 text-xs font-medium text-slate-100">
              Khóa/Bảo trì
            </span>
          </div>
        </div>

        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40"
          />
        </div>
      </header>

      {shouldShowLoadingState ? (
        <div className="text-center py-10 text-white/70">
          Đang tải dữ liệu...
        </div>
      ) : null}

      {shouldShowErrorState ? (
        <div className="text-center py-10 text-red-400">{error}</div>
      ) : null}

      {shouldShowEmptyState ? (
        <div className="text-center py-10 text-white/70">
          Không có lịch sân cho ngày đã chọn.
        </div>
      ) : null}

      {shouldShowTable ? (
        <FieldScheduleTable
          rows={fieldScheduleRows}
          onSlotClick={handleClickSlot}
        />
      ) : null}
    </section>
  );
}
