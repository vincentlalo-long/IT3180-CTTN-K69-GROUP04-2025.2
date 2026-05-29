import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { createTeam } from "../../api/teamApi";

interface CreateTeamFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTeamForm({ onClose, onSuccess }: CreateTeamFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleRemoveEmail = (index: number) => {
    if (emails.length === 1) {
      setEmails([""]);
      return;
    }
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const nextEmails = [...emails];
    nextEmails[index] = value;
    setEmails(nextEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên đội bóng không được để trống.");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Filter out empty emails
    const activeEmails = emails
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    try {
      await createTeam({
        name: name.trim(),
        description: description.trim(),
        memberEmails: activeEmails,
      });
      alert("Đăng ký thành lập đội bóng thành công! Vui lòng chờ Admin phê duyệt.");
      onSuccess();
    } catch (err) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || "Đăng ký đội bóng thất bại. Vui lòng thử lại!";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Đóng form"
        onClick={onClose}
        className="absolute inset-0 bg-[#03150a]/78 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/20 bg-gradient-to-b from-[#05512a] to-[#033b1e] p-6 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)] text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold">Đăng ký thành lập đội bóng</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 p-1.5 transition hover:bg-white/15"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Tên đội bóng <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên đội bóng..."
              className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm placeholder:text-white/40 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Thông tin / Tiểu sử đội bóng
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu về đội bóng, độ tuổi, phong cách chơi..."
              className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm placeholder:text-white/40 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                Email thành viên cần mời
              </label>
              <button
                type="button"
                onClick={handleAddEmail}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <Plus size={14} /> Thêm email
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder={`Email thành viên ${index + 1}`}
                    className="flex-1 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm placeholder:text-white/40 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(index)}
                    className="rounded-lg bg-rose-600/30 p-2 text-rose-400 transition hover:bg-rose-600/50 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/15"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
            >
              {submitting ? "Đang gửi đăng ký..." : "Gửi đăng ký tạo đội"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
