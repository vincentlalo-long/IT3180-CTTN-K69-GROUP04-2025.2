import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-500">
          <LogOut className="h-6 w-6" />
        </div>
        
        <h3 className="mt-4 text-lg font-bold text-slate-900">
          Xác nhận đăng xuất?
        </h3>
        
        <p className="mt-2 text-sm text-slate-500">
          Bạn sẽ cần nhập lại thông tin đăng nhập để tiếp tục đặt sân và tham gia các trận đấu.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-1/2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-1/2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? "Đang xử lý..." : "Đăng xuất"}
          </button>
        </div>
      </div>
    </div>
  );
}
