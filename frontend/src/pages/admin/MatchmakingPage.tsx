import {
  MatchmakingList,
  useMatchmakingManagement,
} from "../../features/matchmaking";

export function MatchmakingPage() {
  const { displayPosts, handleRemovePost } = useMatchmakingManagement();

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Quản lý cáp kèo</h2>
        <p className="mt-1 text-sm text-white/80">
          Theo dõi kèo đang mở, kèo đã chốt và xử lý nhanh các tin cáp kèo không
          hợp lệ.
        </p>
      </header>

      <MatchmakingList posts={displayPosts} onRemovePost={handleRemovePost} />
    </section>
  );
}
