import { Terminal } from "lucide-react";

export function PlayerSystemLinks() {
  return (
    <>
      <p className="mb-2 text-base font-bold text-[#2E7D1E]">Hệ thống</p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            // TODO
          }}
          className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
        >
          <Terminal size={15} className="text-gray-500" />
          Điều khoản và chính sách
        </button>
        <button
          onClick={() => {
            // TODO
          }}
          className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
        >
          <Terminal size={15} className="text-gray-500" />
          Report và hỗ trợ
        </button>
      </div>
    </>
  );
}
