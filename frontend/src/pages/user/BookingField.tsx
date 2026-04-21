import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, X } from "lucide-react";

const defaultCourts = ["Sân 1", "Sân 2", "Sân 3", "Sân 4"];
const defaultTimeSlots = [
  "8:00 - 9:30",
  "9:30 - 11:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
  "18:00 - 19:30",
];

// Mock booked slots — thay bằng API thật sau
const mockBookedSlots: Record<string, boolean> = {
  "Sân 1-8:00 - 9:30": true,
  "Sân 2-15:00 - 16:30": true,
  "Sân 3-18:00 - 19:30": true,
};

const PRICE_PER_SLOT = 100_000;

const parseTimeToHour = (timeStr: string): number => {
  const [hours] = timeStr.split(":").map(Number);
  return hours;
};

const isPastTimeSlot = (slot: string, bookingDate: string): boolean => {
  const now = new Date();
  const [dayStr, monthStr, yearStr] = bookingDate.split("/");
  const bookingDateTime = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (bookingDateTime < today) return true;
  if (bookingDateTime.getTime() === today.getTime()) {
    const slotStartTime = parseTimeToHour(slot.split(" - ")[0]);
    return slotStartTime <= now.getHours();
  }
  return false;
};

type SlotState = "booked" | "selected" | "past" | "available";

const getSlotState = (
  court: string,
  slot: string,
  selected: Record<string, boolean>,
  bookingDate: string,
  bookedSlots: Record<string, boolean>
): SlotState => {
  const key = `${court}-${slot}`;
  if (isPastTimeSlot(slot, bookingDate)) return "past";
  if (bookedSlots[key]) return "booked";
  if (selected[key]) return "selected";
  return "available";
};

const getSlotClassName = (state: SlotState): string => {
  const base = "text-center text-sm py-1.5 px-1 transition-colors rounded-md w-full";
  switch (state) {
    case "booked":
      return `${base} text-[#C8C8C8] font-semibold cursor-not-allowed bg-gray-200`;
    case "selected":
      return `${base} text-white font-semibold cursor-pointer bg-blue-500`;
    case "past":
      return `${base} text-gray-400 font-semibold cursor-not-allowed bg-gray-100`;
    case "available":
      return `${base} text-gray-800 cursor-pointer hover:text-blue-500 hover:bg-blue-50`;
  }
};

interface ConfirmModalProps {
  selectedItems: { court: string; slot: string }[];
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ selectedItems, date, onConfirm, onCancel }: ConfirmModalProps) {
  const total = selectedItems.length * PRICE_PER_SLOT;

  // Group by court
  const grouped = selectedItems.reduce<Record<string, string[]>>((acc, { court, slot }) => {
    if (!acc[court]) acc[court] = [];
    acc[court].push(slot);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#2E9B3F] px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Xác nhận đặt sân</h2>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={15} className="text-[#2E9B3F]" />
            <span>Ngày đặt: <span className="font-semibold text-gray-800">{date}</span></span>
          </div>

          {/* Slots grouped by court */}
          <div className="space-y-2">
            {Object.entries(grouped).map(([court, slots]) => (
              <div key={court} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
                <p className="text-sm font-semibold text-[#2E9B3F] mb-1">{court}</p>
                {slots.map((slot) => (
                  <div key={slot} className="flex items-center justify-between text-sm text-gray-700">
                    <span>⏰ {slot}</span>
                    <span className="font-medium text-gray-500">
                      {PRICE_PER_SLOT.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Tổng tiền</span>
            <span className="text-xl font-bold text-[#2E9B3F]">
              {total.toLocaleString("vi-VN")}đ
            </span>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-400 text-center">
            Vui lòng thanh toán tại quầy khi đến sân
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#2E9B3F] py-2.5 text-sm font-bold text-white hover:bg-[#237a30] transition"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookingField() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("en-GB").split("/").join("/");
  });
  const [showModal, setShowModal] = useState(false);

  // Dùng mock data — khi có API thật thì thay bookedSlots bằng data fetch về
  const bookedSlots = mockBookedSlots;
  const courts = defaultCourts;
  const timeSlots = defaultTimeSlots;

  const getKey = (court: string, slot: string) => `${court}-${slot}`;

  const toggle = (court: string, slot: string) => {
    const state = getSlotState(court, slot, selected, date, bookedSlots);
    if (state === "booked" || state === "past") return;
    const key = getKey(court, slot);
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const slotStates = useMemo(() => {
    const states: Record<string, SlotState> = {};
    courts.forEach((court) => {
      timeSlots.forEach((slot) => {
        states[getKey(court, slot)] = getSlotState(court, slot, selected, date, bookedSlots);
      });
    });
    return states;
  }, [selected, date, bookedSlots, courts, timeSlots]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [yyyy, mm, dd] = e.target.value.split("-");
    setDate(`${dd}/${mm}/${yyyy}`);
    setSelected({});
  };

  const selectedItems = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([key]) => {
      const idx = key.indexOf("-");
      return { court: key.slice(0, idx), slot: key.slice(idx + 1) };
    });

  const handleConfirm = () => {
    // TODO: gọi API đặt sân ở đây
    setShowModal(false);
    setSelected({});
    alert("Đặt sân thành công!");
  };

  const dateInputValue = (() => {
    const [d, m, y] = date.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  })();

  return (
    <>
      {showModal && (
        <ConfirmModal
          selectedItems={selectedItems}
          date={date}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D] p-6">
        <div className="mx-auto max-w-240 overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Header */}
          <div className="bg-[#2E9B3F] px-5 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl font-bold text-white">Đặt lịch trực quan</h1>
              <label className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer transition">
                <input
                  type="date"
                  className="bg-transparent outline-none border-none text-white w-0 opacity-0 absolute"
                  style={{ colorScheme: "dark" }}
                  value={dateInputValue}
                  onChange={handleDateChange}
                />
                <Calendar size={16} />
                <span>{date}</span>
              </label>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-6 text-sm text-white">
              {[
                { color: "bg-white border border-white/60", label: "Trống" },
                { color: "bg-blue-500", label: "Đã chọn" },
                { color: "bg-[#C8C8C8]", label: "Đã đặt" },
                { color: "bg-gray-400", label: "Quá hạn" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`h-5 w-5 rounded-md ${color}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-gray-200 px-5 py-2.5 text-sm">
            <span className="font-bold text-[#E8527A]">Lưu ý: </span>
            <span className="text-gray-700">
              phải đặt sân liên giờ nhau, không được đặt cách nhau
            </span>
          </div>

          <div className="h-2 bg-[#7DD3F8]" />

          {/* Grid */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-4 mb-4">
              {courts.map((court) => (
                <div key={court} className="text-center text-base font-semibold text-gray-800">
                  {court}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {timeSlots.map((slot) => (
                <div key={slot} className="grid grid-cols-4 gap-2">
                  {courts.map((court) => {
                    const key = getKey(court, slot);
                    const state = slotStates[key];
                    return (
                      <button
                        key={court}
                        onClick={() => toggle(court, slot)}
                        disabled={state === "booked" || state === "past"}
                        className={getSlotClassName(state)}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar — chỉ hiện khi có slot được chọn */}
          {selectedItems.length > 0 && (
            <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã chọn {selectedItems.length} slot</p>
                <p className="text-lg font-bold text-[#2E9B3F]">
                  {(selectedItems.length * PRICE_PER_SLOT).toLocaleString("vi-VN")}đ
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-xl bg-[#2E9B3F] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#237a30] transition"
              >
                Đặt sân
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}