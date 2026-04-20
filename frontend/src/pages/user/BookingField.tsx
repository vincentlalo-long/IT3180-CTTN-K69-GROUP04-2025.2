import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";

// Default fallback data
const defaultCourts = ["Sân 1", "Sân 2", "Sân 3", "Sân 4"];
const defaultTimeSlots = [
  "8:00 - 9:30",
  "9:30 - 11:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
  "18:00 - 19:30",
];

// Helper: parse time string to hour
const parseTimeToHour = (timeStr: string): number => {
  const [hours] = timeStr.split(":").map(Number);
  return hours;
};

// Helper: check if slot is in the past
const isPastTimeSlot = (slot: string, bookingDate: string): boolean => {
  const now = new Date();
  const [dayStr, monthStr, yearStr] = bookingDate.split("/");
  const bookingDateTime = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (bookingDateTime < today) return true;
  if (bookingDateTime.getTime() === today.getTime()) {
    const slotStartTime = parseTimeToHour(slot.split(" - ")[0]);
    const currentHour = now.getHours();
    return slotStartTime <= currentHour;
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
  const baseClasses = "text-center text-base transition-colors";
  switch (state) {
    case "booked":
      return `${baseClasses} text-[#C8C8C8] font-semibold cursor-not-allowed bg-gray-200`;
    case "selected":
      return `${baseClasses} text-white font-semibold cursor-pointer bg-blue-500 rounded-md`;
    case "past":
      return `${baseClasses} text-gray-400 font-semibold cursor-not-allowed bg-gray-100`;
    case "available":
      return `${baseClasses} text-gray-800 cursor-pointer hover:text-blue-500 hover:bg-blue-50 rounded-md`;
  }
};

// Replace with your actual API endpoint
const API_ENDPOINT = "/api/fields/slots";

export function BookingField() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("en-GB").split("/").join("/");
  });
  const [slotsData, setSlotsData] = useState<{
    courts: string[];
    timeSlots: string[];
    bookedSlots: Record<string, boolean>;
  }>({
    courts: defaultCourts,
    timeSlots: defaultTimeSlots,
    bookedSlots: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch slot data when date changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_ENDPOINT}?date=${encodeURIComponent(date)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch slots");
        return res.json();
      })
      .then((data) => {
        setSlotsData({
          courts: data.courts || defaultCourts,
          timeSlots: data.timeSlots || defaultTimeSlots,
          bookedSlots: data.bookedSlots || {},
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date]);

  const getKey = (court: string, slot: string) => `${court}-${slot}`;

  const toggle = (court: string, slot: string) => {
    const key = getKey(court, slot);
    const state = getSlotState(court, slot, selected, date, slotsData.bookedSlots);
    if (state === "booked" || state === "past") return;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const slotStates = useMemo(() => {
    const states: Record<string, SlotState> = {};
    slotsData.courts.forEach((court) => {
      slotsData.timeSlots.forEach((slot) => {
        const key = getKey(court, slot);
        states[key] = getSlotState(court, slot, selected, date, slotsData.bookedSlots);
      });
    });
    return states;
  }, [selected, date, slotsData]);

  // Date picker handler
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // yyyy-MM-dd
    const [yyyy, mm, dd] = val.split("-");
    setDate(`${dd}/${mm}/${yyyy}`);
    setSelected({});
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-240 overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="bg-[#2E9B3F] px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold text-white">Đặt lịch trực quan</h1>
            <label className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20 cursor-pointer">
              <input
                type="date"
                className="bg-transparent outline-none border-none text-white"
                style={{ colorScheme: "dark" }}
                value={(() => {
                  const [d, m, y] = date.split("/");
                  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
                })()}
                onChange={handleDateChange}
              />
              <span>{date}</span>
              <Calendar size={16} />
            </label>
          </div>
          {/* ...legend code... */}
        </div>
        {/* ...info and separator... */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-4 mb-4">
                {slotsData.courts.map((court) => (
                  <div key={court} className="text-center text-base font-semibold text-gray-800">
                    {court}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-6">
                {slotsData.timeSlots.map((slot) => (
                  <div key={slot} className="grid grid-cols-4">
                    {slotsData.courts.map((court) => {
                      const key = getKey(court, slot);
                      const state = slotStates[key];
                      const isDisabled = state === "booked" || state === "past";
                      return (
                        <button
                          key={court}
                          onClick={() => toggle(court, slot)}
                          disabled={isDisabled}
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
      </div>
    </div>
  );
}