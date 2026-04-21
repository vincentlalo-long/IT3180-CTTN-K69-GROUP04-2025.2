import { useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, Search } from "lucide-react";
import logoImage from "../../assets/images/logo-amixi.png";
import logoFootball from "../../assets/images/logo-ball.jpg";
import fieldImage from "../../assets/images/Old_Trafford.jpg";
import { UserNavbar } from "../../components/user/UserNavbar.tsx";
type FieldCardProps = {
  id: number;
  imageUrl?: string;
  ballLogoUrl?: string;
  name: string;
  address: string;
  openTime: string;
};

function BookingFieldCard({
  imageUrl = fieldImage,
  ballLogoUrl = logoFootball,
  name,
  address,
  openTime,
}: FieldCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/booking/:fieldId")}
      className="overflow-hidden rounded-2xl border-2 border-black/60 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:scale-[1.01] hover:brightness-95 text-left w-full"
    >
      <div
        className="relative h-[160px] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <span className="absolute right-3 top-3 rounded-lg bg-[#F8B416] px-3 py-1.5 text-sm font-bold text-white shadow">
          Đặt lịch
        </span>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={ballLogoUrl}
          alt="football"
          className="h-12 w-12 rounded-full object-cover shadow shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#0B582A] leading-tight">
            {name}
          </h3>
          <p className="text-[11px] text-gray-600 truncate">{address}</p>
          <p className="text-[11px] text-gray-600">{openTime}</p>
        </div>
      </div>
    </button>
  );
}

export function BookingPage() {
  const navigate = useNavigate();

  const fields = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    imageUrl: fieldImage,
    ballLogoUrl: logoFootball,
    name: "SÂN BÓNG ĐỀN LỪ 3",
    address: "P. Tân Mai, Hoàng Văn Thụ, Hoàng Mai, Hà Nội",
    openTime: "Giờ mở cửa: Cả ngày",
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <UserNavbar />

      <div className="bg-[#005E2E]/40">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              placeholder="Hinted search text"
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Khu vực
          </button>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Ngày đặt sân
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <BookingFieldCard key={field.id} {...field} />
          ))}
        </div>
      </main>
    </div>
  );
}