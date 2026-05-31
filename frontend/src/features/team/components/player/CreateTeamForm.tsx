import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { createTeam } from "../../api/teamApi";

interface CreateTeamFormProps {
  onClose?: () => void;
  onSuccess: () => void;
  isInline?: boolean;
}

export function CreateTeamForm({ onClose, onSuccess, isInline = false }: CreateTeamFormProps) {
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

  const formContent = (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          Tên đội bóng <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên đội bóng..."
          className="w-full rounded-xl border-2 border-black/40 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#005E2E] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          Thông tin / Tiểu sử đội bóng
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Giới thiệu về đội bóng, độ tuổi, phong cách chơi..."
          className="w-full rounded-xl border-2 border-black/40 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#005E2E] focus:outline-none resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
            Email thành viên cần mời
          </label>
          <button
            type="button"
            onClick={handleAddEmail}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#005E2E] hover:text-[#0b582a]"
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
                className="flex-1 rounded-xl border-2 border-black/40 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#005E2E] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveEmail(index)}
                className="rounded-lg bg-rose-100 border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 mt-6">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-black/60 bg-white px-5 py-2 text-sm font-bold text-gray-800 transition hover:bg-gray-100"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#005E2E] hover:bg-[#004d26] px-6 py-2.5 text-sm font-extrabold uppercase text-white shadow-[0_4px_12px_rgba(0,94,46,0.25)] transition duration-200 disabled:opacity-50"
        >
          {submitting ? "Đang gửi đăng ký..." : "Gửi đăng ký tạo đội"}
        </button>
      </div>
    </form>
  );

  if (isInline) {
    return (
      <div className="w-full rounded-2xl border-2 border-black/60 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.35)] text-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-lg font-extrabold text-[#0B582A]">Đăng ký thành lập đội bóng</h3>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Đóng form"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border-2 border-black/60 bg-white p-6 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)] text-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-lg font-extrabold text-[#0B582A]">Đăng ký thành lập đội bóng</h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border-2 border-black/60 bg-white p-1.5 transition hover:bg-gray-100 text-gray-800"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {formContent}
      </div>
    </div>
  );
}
