import { ALL_FACILITIES_ID } from "../../data/mockAdminData";
import { FieldScheduleTable, useFieldSchedule } from "../../features/booking";

export function FieldSchedulePage() {
  const {
    fieldScheduleRows,
    handleClickSlot,
    selectedFacility,
    selectedFacilityId,
  } = useFieldSchedule();

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Quản lý lịch sân</h2>
        <p className="mt-1 text-sm text-white/80">
          {selectedFacilityId === ALL_FACILITIES_ID
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
          <span className="rounded-full border border-lime-100/90 bg-lime-300/45 px-3 py-1 text-xs font-medium text-[#123915]">
            Đang đá
          </span>
          <span className="rounded-full border border-slate-200/45 bg-white/12 px-3 py-1 text-xs font-medium text-slate-100">
            Khóa/Bảo trì
          </span>
        </div>
      </header>

      <FieldScheduleTable
        rows={fieldScheduleRows}
        onSlotClick={handleClickSlot}
      />
    </section>
  );
}
