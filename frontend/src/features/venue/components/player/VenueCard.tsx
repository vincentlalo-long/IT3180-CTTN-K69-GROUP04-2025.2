import { useNavigate } from "react-router-dom";

import fieldImage from "../../../../assets/images/Old_Trafford.jpg";
import logoFootball from "../../../../assets/images/logo-ball.jpg";
import type { VenueItem } from "../../types/venue.types";

interface VenueCardProps {
  data: VenueItem;
}

export function VenueCard({ data }: VenueCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/booking/:fieldId")}
      className="overflow-hidden rounded-2xl border-2 border-black/60 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:scale-[1.01] hover:brightness-95 text-left w-full"
    >
      <div
        className="relative h-[160px] bg-cover bg-center"
        style={{ backgroundImage: `url(${data.imageUrl ?? fieldImage})` }}
      >
        <span className="absolute right-3 top-3 rounded-lg bg-[#F8B416] px-3 py-1.5 text-sm font-bold text-white shadow">
          Đặt lịch
        </span>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={data.ballLogoUrl ?? logoFootball}
          alt="football"
          className="h-12 w-12 rounded-full object-cover shadow shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#0B582A] leading-tight">
            {data.name}
          </h3>
          <p className="text-[11px] text-gray-600 truncate">{data.address}</p>
          <p className="text-[11px] text-gray-600">{data.openTime}</p>
        </div>
      </div>
    </button>
  );
}
