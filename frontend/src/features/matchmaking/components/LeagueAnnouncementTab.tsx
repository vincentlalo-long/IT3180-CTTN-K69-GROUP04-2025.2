import React, { useState, useEffect, useCallback } from "react";
import { Megaphone, RefreshCw, PlusCircle } from "lucide-react";
import { announcementApi } from "../api/announcement.api";
import type { LeagueAnnouncement } from "../types/announcement.types";
import { toast } from "../../../shared/utils/toast";

interface LeagueAnnouncementTabProps {
  leagueId: number;
  isAdmin?: boolean;
}

export const LeagueAnnouncementTab: React.FC<LeagueAnnouncementTabProps> = ({ leagueId, isAdmin = false }) => {
  const [announcements, setAnnouncements] = useState<LeagueAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states for Admin
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await announcementApi.getAnnouncementsByLeague(leagueId);
      // Sort by latest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(sortedData);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải bảng tin");
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (leagueId) {
      fetchAnnouncements();
    }
  }, [leagueId, fetchAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }
    
    setSubmitting(true);
    try {
      await announcementApi.createAnnouncement(leagueId, { title, content });
      toast.success("Đăng thông báo thành công!");
      setTitle("");
      setContent("");
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi đăng thông báo");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-white/50">
        <RefreshCw size={24} className="animate-spin text-emerald-500 mb-3" />
        <p className="text-sm">Đang tải bảng tin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="bg-[#0C5E2A] rounded-xl p-5 border border-white/10">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              <PlusCircle size={16} />
              Tạo thông báo mới
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-semibold">Tạo thông báo mới</h4>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="text-white/50 hover:text-white text-sm transition"
                >
                  Hủy
                </button>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Tiêu đề thông báo..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-[#0C5E2A]/70 px-4 py-2.5 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <textarea
                  placeholder="Nội dung thông báo..."
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-[#0C5E2A]/70 px-4 py-2.5 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Megaphone size={16} />}
                  Đăng thông báo
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
            <Megaphone size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/60">Chưa có thông báo nào từ Ban tổ chức.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-lg font-bold text-emerald-400">{announcement.title}</h4>
                <span className="shrink-0 text-xs text-white/40 font-medium">
                  {new Date(announcement.createdAt).toLocaleDateString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </span>
              </div>
              <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">
                {announcement.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
