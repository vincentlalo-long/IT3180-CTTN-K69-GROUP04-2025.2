import { Trash2 } from "lucide-react";

import { getStatusClass, getTimeLeftText } from "../../utils/matchmaking.utils";
import type {
  MatchmakingPost,
  MatchmakingStatus,
} from "../../types/matchmaking.types";

type MatchmakingListItem = MatchmakingPost & {
  displayStatus: MatchmakingStatus;
};

interface MatchmakingListProps {
  posts: MatchmakingListItem[];
  onRemovePost: (postId: string) => void;
}

export function MatchmakingList({ posts, onRemovePost }: MatchmakingListProps) {
  return (
    <div className="rounded-2xl border border-white/15 bg-[#005E2E]/32 p-4 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] sm:p-5">
      <div className="space-y-3">
        {posts.map((post, index) => {
          const rowTone =
            index % 2 === 0 ? "bg-[#0d5a2f]/65" : "bg-[#0a4d29]/65";

          return (
            <article
              key={post.id}
              className={`rounded-xl border border-white/10 px-4 py-3 shadow-sm transition hover:border-white/25 hover:bg-[#146f3d]/70 ${rowTone}`}
            >
              <div className="grid gap-3 lg:grid-cols-[1.25fr_0.9fr_1.7fr_1fr_1fr_auto] lg:items-center">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/65">
                    Tên đội
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {post.teamName}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/65">
                    Trình độ
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-lime-100">
                    {post.level}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/65">
                    Sân &amp; Ca đá
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-white">
                    {post.fieldAndShift}
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">
                    Loại kèo: {post.matchType}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/65">
                    Trạng thái
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(post.displayStatus)}`}
                  >
                    {post.displayStatus}
                  </span>
                  {post.displayStatus === "Đang tìm" ? (
                    <p className="mt-1 text-[11px] text-cyan-100">
                      {getTimeLeftText(post.matchDate)}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/65">
                    Giờ đá
                  </p>
                  <p className="mt-0.5 text-sm text-white/85">
                    {new Date(post.matchDate).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex justify-start lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onRemovePost(post.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                  >
                    <Trash2 size={14} />
                    Gỡ kèo
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-white/15 bg-[#0a4d29]/60 px-4 py-8 text-center text-sm text-white/80">
          Không còn tin cáp kèo nào trong danh sách.
        </div>
      ) : null}
    </div>
  );
}
