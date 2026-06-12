import React, { useState, useEffect, useCallback } from "react";
import { Megaphone, MessageSquare, Trash2, Send, Calendar, Clock, Edit3, Plus, X } from "lucide-react";
import { 
  getLeagueAnnouncements, 
  createLeagueAnnouncement, 
  updateLeagueAnnouncement, 
  deleteLeagueAnnouncement,
  getAnnouncementComments,
  addAnnouncementComment,
  deleteAnnouncementComment
} from "../api/league.api";
import type { LeagueAnnouncement, LeagueAnnouncementComment } from "../api/league.api";
import { toast } from "../../../shared/utils/toast";

interface LeagueAnnouncementTabProps {
  leagueId: number;
  isAdmin?: boolean;
}

export const LeagueAnnouncementTab: React.FC<LeagueAnnouncementTabProps> = ({ 
  leagueId, 
  isAdmin = false 
}) => {
  const [announcements, setAnnouncements] = useState<LeagueAnnouncement[]>([]);
  const [comments, setComments] = useState<Record<number, LeagueAnnouncementComment[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
  
  // Announcement Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New comment input
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Get current user ID from token/localStorage (rough check)
  const getCurrentUserId = (): number | null => {
    try {
      const userIdStr = localStorage.getItem("userId");
      if (userIdStr) {
        return parseInt(userIdStr) || null;
      }
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        return u.id || u.userId || null;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeagueAnnouncements(leagueId);
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const loadComments = async (announcementId: number) => {
    try {
      const commentList = await getAnnouncementComments(announcementId);
      setComments(prev => ({
        ...prev,
        [announcementId]: commentList
      }));
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải bình luận");
    }
  };

  const toggleAnnouncementExpand = (announcementId: number) => {
    if (selectedAnnouncementId === announcementId) {
      setSelectedAnnouncementId(null);
    } else {
      setSelectedAnnouncementId(announcementId);
      loadComments(announcementId);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setContent("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (announcement: LeagueAnnouncement, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Tiêu đề và nội dung không được để trống");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editId) {
        await updateLeagueAnnouncement(editId, { title, content });
        toast.success("Cập nhật thông báo thành công!");
      } else {
        await createLeagueAnnouncement(leagueId, { title, content });
        toast.success("Đăng thông báo mới thành công!");
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu thông báo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
      return;
    }

    try {
      await deleteLeagueAnnouncement(id);
      toast.success("Xóa thông báo thành công!");
      if (selectedAnnouncementId === id) {
        setSelectedAnnouncementId(null);
      }
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleAddComment = async (announcementId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addAnnouncementComment(announcementId, { content: newCommentText });
      setNewCommentText("");
      loadComments(announcementId);
      toast.success("Đã bình luận");
    } catch (error) {
      console.error(error);
      toast.error("Không thể gửi bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (announcementId: number, commentId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      return;
    }

    try {
      await deleteAnnouncementComment(commentId);
      toast.success("Xóa bình luận thành công!");
      loadComments(announcementId);
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa bình luận");
    }
  };

 const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {  // ✅ Bỏ hoàn toàn tham số e nếu không dùng
    return dateStr;
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Megaphone className="text-emerald-400" size={20} />
          Bảng tin thông báo của Giải đấu
        </h3>
        
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-500 transition"
          >
            <Plus size={16} />
            Đăng thông báo mới
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-white/60 text-sm">Đang tải thông báo...</p>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/5 p-8 text-center text-white/50">
          <Megaphone size={36} className="mx-auto text-white/10 mb-2" />
          <p className="text-sm">Hiện chưa có thông báo nào được đăng tải từ Ban tổ chức giải.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isExpanded = selectedAnnouncementId === ann.id;
            const commentList = comments[ann.id] || [];

            return (
              <div 
                key={ann.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded 
                    ? "border-emerald-500/30 bg-emerald-950/20" 
                    : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                }`}
              >
                {/* Header info */}
                <div 
                  onClick={() => toggleAnnouncementExpand(ann.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-md font-bold text-white group-hover:text-emerald-400">
                      {ann.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(ann.createdAt)}
                      </span>
                      {ann.updatedAt !== ann.createdAt && (
                        <span className="flex items-center gap-1 italic">
                          <Clock size={12} />
                          Cập nhật: {formatDate(ann.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => handleOpenEditModal(ann, e)}
                          className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition"
                          title="Sửa thông báo"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteAnnouncement(ann.id, e)}
                          className="p-1.5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded transition"
                          title="Xóa thông báo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1 rounded bg-black/40 px-2 py-1 text-xs text-emerald-400 font-medium">
                      <MessageSquare size={12} />
                      Bình luận
                    </span>
                  </div>
                </div>

                {/* Expanded content & comments */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-5 bg-black/20 space-y-6">
                    <div className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                      {ann.content}
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-white/10 pt-4 space-y-4">
                      <h5 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare size={14} />
                        Bình luận ({commentList.length})
                      </h5>

                      {/* Comment input form */}
                      <form onSubmit={(e) => handleAddComment(ann.id, e)} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Viết bình luận dưới thông báo này..."
                          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-emerald-500/40 focus:bg-white/10 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={submittingComment || !newCommentText.trim()}
                          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition disabled:opacity-50"
                        >
                          <Send size={16} />
                        </button>
                      </form>

                      {/* Comment List */}
                      {commentList.length === 0 ? (
                        <p className="text-white/40 text-xs italic">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                      ) : (
                        <div className="space-y-3 pt-2">
                          {commentList.map((c) => {
                            const isMyComment = c.userId === currentUserId;
                            const canDelete = isMyComment || isAdmin;

                            return (
                              <div key={c.id} className="flex gap-3 text-sm bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0 overflow-hidden">
                                  {c.userAvatarUrl ? (
                                    <img src={c.userAvatarUrl} alt={c.username} className="w-full h-full object-cover" />
                                  ) : (
                                    c.username.substring(0, 2).toUpperCase()
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-emerald-400">{c.username}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40">{formatDate(c.createdAt)}</span>
                                      {canDelete && (
                                        <button
                                          onClick={() => handleDeleteComment(ann.id, c.id)}
                                          className="text-white/40 hover:text-red-400 p-0.5 rounded transition"
                                          title="Xóa bình luận"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-white/80 leading-relaxed text-sm">{c.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Write/Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#002B15] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="text-emerald-400" size={18} />
                {isEditing ? "Chỉnh sửa thông báo" : "Đăng thông báo mới"}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/50 uppercase">Tiêu đề thông báo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề (ví dụ: Cập nhật giờ thi đấu vòng 2)..."
                  className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-500/40 focus:bg-black/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/50 uppercase">Nội dung thông báo</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết thông báo..."
                  rows={6}
                  className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-500/40 focus:bg-black/30 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow transition disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Đăng thông báo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
