import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type MatchmakingStatus = "Đang tìm" | "Đã chốt" | "Hết hạn" | "Bị hủy";

type MatchmakingLevel = "Phong trào" | "Trung bình" | "Khá" | "Bán chuyên";

type MatchType = "Đấu giao hữu" | "Kèo đồng trình" | "Đá tập" | "Kèo phủi";

interface MatchmakingPost {
  id: string;
  teamName: string;
  level: MatchmakingLevel;
  fieldAndShift: string;
  matchType: MatchType;
  status: MatchmakingStatus;
  matchDate: string;
}

const THREE_HOURS = 3 * 60 * 60 * 1000;

const hoursFromNow = (hours: number): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const mockMatchmaking: MatchmakingPost[] = [
  {
    id: "mk-001",
    teamName: "FC Đền Lừ Lightning",
    level: "Khá",
    fieldAndShift: "Sân 1 - Ca 1 (17:30 - 19:00)",
    matchType: "Kèo đồng trình",
    status: "Đang tìm",
    matchDate: hoursFromNow(6),
  },
  {
    id: "mk-002",
    teamName: "Đầm Hồng Brothers",
    level: "Trung bình",
    fieldAndShift: "Sân 2 - Ca 2 (19:00 - 20:30)",
    matchType: "Đấu giao hữu",
    status: "Đã chốt",
    matchDate: hoursFromNow(26),
  },
  {
    id: "mk-003",
    teamName: "Đại Từ Warriors",
    level: "Phong trào",
    fieldAndShift: "Sân 3 - Ca 3 (20:30 - 22:00)",
    matchType: "Đá tập",
    status: "Đang tìm",
    matchDate: hoursFromNow(2),
  },
  {
    id: "mk-004",
    teamName: "MIXI Young Stars",
    level: "Bán chuyên",
    fieldAndShift: "Sân 1 - Ca 2 (18:00 - 19:30)",
    matchType: "Kèo phủi",
    status: "Hết hạn",
    matchDate: hoursFromNow(-1),
  },
  {
    id: "mk-005",
    teamName: "Hà Đông Ballers",
    level: "Khá",
    fieldAndShift: "Sân 2 - Ca 1 (16:00 - 17:30)",
    matchType: "Đấu giao hữu",
    status: "Bị hủy",
    matchDate: hoursFromNow(14),
  },
  {
    id: "mk-006",
    teamName: "Tây Hồ Falcons",
    level: "Trung bình",
    fieldAndShift: "Sân 4 - Ca 1 (17:30 - 19:00)",
    matchType: "Kèo đồng trình",
    status: "Đang tìm",
    matchDate: hoursFromNow(10),
  },
];

const getDisplayStatus = (post: MatchmakingPost): MatchmakingStatus => {
  const timeToMatch = new Date(post.matchDate).getTime() - Date.now();

  if (post.status === "Đang tìm" && timeToMatch < THREE_HOURS) {
    return "Hết hạn";
  }

  return post.status;
};

const getStatusClass = (status: MatchmakingStatus): string => {
  if (status === "Đang tìm") {
    return "animate-pulse border border-cyan-100/75 bg-cyan-300/40 text-cyan-900";
  }

  if (status === "Đã chốt") {
    return "border border-lime-100/90 bg-lime-300/45 text-[#123915]";
  }

  if (status === "Bị hủy") {
    return "border border-rose-100/80 bg-rose-400/35 text-rose-50";
  }

  return "border border-slate-200/45 bg-white/12 text-slate-100";
};

const getTimeLeftText = (matchDate: string): string => {
  const diff = new Date(matchDate).getTime() - Date.now();

  if (diff <= 0) {
    return "Đã quá giờ ghép kèo";
  }

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (hours <= 0) {
    return `Hết hạn sau ${minutes}m`;
  }

  return `Hết hạn sau ${hours}h ${minutes}m`;
};

export function MatchmakingPage() {
  const [posts, setPosts] = useState<MatchmakingPost[]>(mockMatchmaking);

  const displayPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        displayStatus: getDisplayStatus(post),
      })),
    [posts],
  );

  const handleRemovePost = (postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId));
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Quản lý cáp kèo</h2>
        <p className="mt-1 text-sm text-white/80">
          Theo dõi kèo đang mở, kèo đã chốt và xử lý nhanh các tin cáp kèo không
          hợp lệ.
        </p>
      </header>

      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/32 p-4 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] sm:p-5">
        <div className="space-y-3">
          {displayPosts.map((post, index) => {
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
                      onClick={() => handleRemovePost(post.id)}
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

        {displayPosts.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-[#0a4d29]/60 px-4 py-8 text-center text-sm text-white/80">
            Không còn tin cáp kèo nào trong danh sách.
          </div>
        ) : null}
      </div>
    </section>
  );
}
