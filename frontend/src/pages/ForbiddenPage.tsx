import { Link } from "react-router-dom";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#103314] text-white p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-rose-500 mb-4">403</h1>
        <p className="text-lg font-medium mb-6">
          403 - Bạn không có quyền truy cập khu vực này.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700 transition"
        >
          Quay lại Trang chủ
        </Link>
      </div>
    </div>
  );
}
