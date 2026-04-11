import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";

const courts = ["Sân 1", "Sân 2", "Sân 3", "Sân 4"];

const timeSlots = [
  "8:00 - 9:30",
  "9:30 - 11:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
  "18:00 - 19:30",
];

const defaultLocked: Record<string, boolean> = {
  "Sân 2-8:00 - 9:30": true,
  "Sân 3-15:00 - 16:30": true,
};

export function BookingField() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [date] = useState("02/04/2026");

  const getKey = (court: string, slot: string) => `${court}-${slot}`;

  const toggle = (court: string, slot: string) => {
    const key = getKey(court, slot);
    if (defaultLocked[key]) return;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStyle = (court: string, slot: string) => {
    const key = getKey(court, slot);
    if (defaultLocked[key]) return "text-[#E8527A] font-semibold cursor-default";
    if (selected[key]) return "text-[#E8527A] font-semibold cursor-pointer";
    return "text-gray-800 cursor-pointer hover:text-[#E8527A] transition-colors";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="bg-[#2E9B3F] px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold text-white">Đặt lịch trực quan</h1>
            <button className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20">
              {date}
              <Calendar size={16} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-6 text-sm text-white">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md border border-white/60 bg-white" />
              <span>Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-[#E8527A]" />
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-[#C8C8C8]" />
              <span>Khóa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-[#A855F7]" />
              <span>Sự kiện</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 px-5 py-2.5 text-sm">
          <span className="font-bold text-[#E8527A]">Lưu ý: </span>
          <span className="text-gray-700">
            phải đặt sân liên giờ nhau, không được đặt cách nhau
          </span>
        </div>

        <div className="h-2 bg-[#7DD3F8]" />

        <div className="px-6 py-4">
          <div className="grid grid-cols-4 mb-4">
            {courts.map((court) => (
              <div key={court} className="text-center text-base font-semibold text-gray-800">
                {court}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {timeSlots.map((slot) => (
              <div key={slot} className="grid grid-cols-4">
                {courts.map((court) => (
                  <button
                    key={court}
                    onClick={() => toggle(court, slot)}
                    disabled={!!defaultLocked[getKey(court, slot)]}
                    className={`text-center text-base ${getStyle(court, slot)}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}