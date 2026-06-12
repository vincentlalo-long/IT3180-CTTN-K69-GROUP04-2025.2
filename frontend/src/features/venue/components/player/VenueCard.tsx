import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

import fieldImage from "../../../../assets/images/Old_Trafford.jpg";
import logoFootball from "../../../../assets/images/logo-ball.jpg";
import type { VenueItem } from "../../types/venue.types";
import { formatMoney } from "@/features/booking/utils/booking.utils";

interface VenueCardProps {
  data: VenueItem;
}

export function VenueCard({ data }: VenueCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/booking/${data.id}`)}
      className="group overflow-hidden rounded-2xl border-2 border-black/60 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:scale-[1.01] hover:brightness-95 text-left w-full"
    >
      <div
        className="relative h-[160px] w-full bg-slate-100 overflow-hidden"
      >
        <img 
          src={data.imageUrl ?? fieldImage} 
          alt={data.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
             (e.target as HTMLImageElement).src = fieldImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        <span className="absolute right-3 top-3 rounded-lg bg-[#F8B416] px-3 py-1.5 text-xs font-bold text-white shadow-lg uppercase tracking-wider">
          Đặt lịch
        </span>
        {data.minPrice !== undefined && (
           <div className="absolute bottom-3 left-4 text-white">
             <p className="text-[10px] uppercase font-bold opacity-80">Giá chỉ từ</p>
             <p className="text-lg font-black">{formatMoney(data.minPrice)}</p>
           </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <img
          src={data.ballLogoUrl ?? logoFootball}
          alt="logo"
          className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md shrink-0 -mt-8 relative z-10"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-[#0B582A] leading-tight truncate">
            {data.name}
          </h3>
          <div className="mt-1 flex flex-col gap-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              {data.address}
            </p>
            <p className="text-[10px] text-gray-400 font-bold">{data.openTime}</p>
            <p className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
              <Star size={12} className={data.reviewCount ? "fill-current" : ""} />
              {data.reviewCount
                ? `${(data.averageRating ?? 0).toFixed(1)} (${data.reviewCount})`
                : "Chưa có đánh giá"}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
