import { useState, useMemo, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, X } from "lucide-react";
import { getBookedSlots, bookSlots } from "../../features/booking/api/userApi";

interface BookedSlot {
  court: string;
  slot: string;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  let startHour = 6;
  let startMinute = 0;
  while (true) {
    const end = new Date(0, 0, 0, startHour, startMinute + 90);
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    slots.push(
      `${startHour.toString().padStart(2, "0")}:${startMinute
        .toString()
        .padStart(2, "0")} - ${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`,
    );
    if (endHour > 22 || (endHour === 22 && endMinute > 0) || endHour >= 23)
      break;
    startHour = endHour;
    startMinute = endMinute;
  }
  return slots;
}

const defaultCourts = ["Sân 1", "Sân 2", "Sân 3", "Sân 4"];
const defaultTimeSlots = generateTimeSlots();
const PRICE_PER_SLOT = 100_000;

const parseTimeToHour = (timeStr: string): number => {
  const [hours] = timeStr.split(":").map(Number);
  return hours;
};

const isPastTimeSlot = (slot: string, bookingDate: string): boolean => {
  const now = new Date();
  const [dayStr, monthStr, yearStr] = bookingDate.split("/");
  const bookingDateTime = new Date(
    Number(yearStr),
    Number(monthStr) - 1,
    Number(dayStr),
  );
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
  bookedSlots: Record<string, boolean>,
): SlotState => {
  const key = `${court}-${slot}`;
  if (isPastTimeSlot(slot, bookingDate)) return "past";
  if (bookedSlots[key]) return "booked";
  if (selected[key]) return "selected";
  return "available";
};

const getSlotClassName = (state: SlotState): string => {
  const base =
    "text-center text-sm py-1.5 px-1 transition-colors rounded-md w-full";
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

// --- Fetch state reducer ---
type FetchAction =
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

type FetchState = { loading: boolean; error: string | null };

const fetchReducer = (state: FetchState, action: FetchAction): FetchState => {
  switch (action.type) {
    case "loading":
      return { loading: true, error: null };
    case "success":
      return { loading: false, error: null };
    case "error":
      return { loading: false, error: action.message };
    default:
      return state;
  }
};

// --- Confirm Modal ---
interface ConfirmModalProps {
  selectedItems: { court: string; slot: string }[];
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  selectedItems,
  date,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const total = selectedItems.length * PRICE_PER_SLOT;

  const grouped = selectedItems.reduce<Record<string, string[]>>(
    (acc, { court, slot }) => {
      if (!acc[court]) acc[court] = [];
      acc[court].push(slot);
      return acc;
    },
    {},
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-[#2E9B3F] px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Xác nhận đặt sân</h2>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={15} className="text-[#2E9B3F]" />
            <span>
              Ngày đặt:{" "}
              <span className="font-semibold text-gray-800">{date}</span>
            </span>
          </div>

          <div className="space-y-2">
            {Object.entries(grouped).map(([court, slots]) => (
              <div
                key={court}
                className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5"
              >
                <p className="text-sm font-semibold text-[#2E9B3F] mb-1">
                  {court}
                </p>
                {slots.map((slot) => (
                  <div
                    key={slot}
                    className="flex items-center justify-between text-sm text-gray-700"
                  >
                    <span>⏰ {slot}</span>
                    <span className="font-medium text-gray-500">
                      {PRICE_PER_SLOT.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-200" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Tổng tiền
            </span>
            <span className="text-xl font-bold text-[#2E9B3F]">
              {total.toLocaleString("vi-VN")}đ
            </span>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Vui lòng thanh toán tại quầy khi đến sân
          </p>
        </div>

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

// --- Main Component ---
export function BookingField() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("en-GB").split("/").join("/");
  });
  const [showModal, setShowModal] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Record<string, boolean>>({});
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    loading: false,
    error: null,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const courts = defaultCourts;
  const timeSlots = defaultTimeSlots;

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "loading" });

    getBookedSlots(date)
      .then((slots: BookedSlot[]) => {
        if (cancelled) return;
        const booked: Record<string, boolean> = {};
        slots.forEach(({ court, slot }: BookedSlot) => {
          booked[`${court}-${slot}`] = true;
        });
        setBookedSlots(booked);
        dispatch({ type: "success" });
      })
      .catch(() => {
        if (cancelled) return;
        dispatch({ type: "error", message: "Không thể tải dữ liệu đặt sân" });
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

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
        states[getKey(court, slot)] = getSlotState(
          court,
          slot,
          selected,
          date,
          bookedSlots,
        );
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

  const handleBooking = async (
    items: { court: string; slot: string }[],
    bookingDate: string,
  ) => {
    const bookingData = { date: bookingDate, slots: items };
    const res = await bookSlots(bookingData);
    if (!res.success) {
      throw new Error(res.message || "Đặt sân thất bại");
    }
  };

  const handleConfirm = async () => {
    try {
      await handleBooking(selectedItems, date);
      setShowModal(false);
      setSelected({});
      setDate((prev) => prev);
      alert("Đặt sân thành công!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi khi đặt sân!";
      alert(msg);
    }
  };

  const dateInputValue = (() => {
    const [d, m, y] = date.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  })();

  const todayInputValue = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
        <div className="mx-auto max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Header */}
          <div className="bg-[#2E9B3F] px-5 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl font-bold text-white">
                Đặt lịch trực quan
              </h1>
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer transition"
                  onClick={() => setCalendarOpen((open) => !open)}
                >
                  <Calendar size={16} />
                  <span>{date}</span>
                </button>
                {calendarOpen && (
                  <div className="absolute right-0 mt-2 z-50 bg-white rounded-xl shadow-lg p-4">
                    <input
                      type="date"
                      className="text-gray-800 border rounded px-2 py-1"
                      value={dateInputValue}
                      min={todayInputValue}
                      onChange={(e) => {
                        handleDateChange(e);
                        setCalendarOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
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
            {fetchState.loading ? (
              <div className="py-10 text-center text-gray-400">
                Đang tải dữ liệu...
              </div>
            ) : fetchState.error ? (
              <div className="py-10 text-center text-red-400">
                {fetchState.error}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 mb-4">
                  {courts.map((court) => (
                    <div
                      key={court}
                      className="text-center text-base font-semibold text-gray-800"
                    >
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
              </>
            )}
          </div>

          {/* Bottom bar */}
          {selectedItems.length > 0 && (
            <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Đã chọn {selectedItems.length} slot
                </p>
                <p className="text-lg font-bold text-[#2E9B3F]">
                  {(selectedItems.length * PRICE_PER_SLOT).toLocaleString(
                    "vi-VN",
                  )}
                  đ
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