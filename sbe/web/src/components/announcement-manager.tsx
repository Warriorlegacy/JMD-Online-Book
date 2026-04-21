"use client";

import { useState, useEffect } from "react";
import { Check, X, Edit, Trash2, Megaphone } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { Announcement } from "@/types";

export function AnnouncementManager() {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    const res = await fetch("/api/admin/announcements");
    if (res.ok) setAnnouncements(await res.json());
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (user?.role !== "admin") return null;

  const handleCreate = async () => {
    if (!newMessage.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim(), active: 1 }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchAnnouncements();
      } else console.error("Failed to create announcement");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editText.trim(), active: announcements.find(a => a.id === id)?.active }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchAnnouncements();
      } else console.error("Failed to update announcement");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (loading) return;
    if (!confirm("Delete this announcement?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (res.ok) fetchAnnouncements();
      else console.error("Failed to delete announcement");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-[#0071e3]" />
        <h2 className="text-xl font-bold tracking-tight text-white font-display">
          Announcements
        </h2>
      </div>

      {/* New announcement */}
      <div className="glass-card p-6 space-y-4">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter premium announcement text..."
          className="w-full h-24 bg-black/40 border border-[#f5f5f7]/10 rounded-xl p-4 text-sm text-[#f5f5f7] placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0071e3]/40 transition-all font-text"
        />
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            disabled={loading || !newMessage.trim()}
            className="px-8 h-12 bg-[#0071e3] text-white font-semibold rounded-full hover:bg-[#0071e3]/90 active:scale-95 transition-all disabled:opacity-50 text-sm font-display shadow-lg shadow-[#0071e3]/20"
          >
            Post Announcement
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-4 rounded-2xl glass-card flex items-start gap-4 hover:border-[#0071e3]/30 transition-colors group"
          >
            <div className="flex-1 mt-1">
              {editingId === ann.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-24 bg-black/20 border border-[#0071e3]/20 rounded-xl p-4 text-sm text-white resize-none focus:outline-none ring-1 ring-[#0071e3]/40 font-text"
                  autoFocus
                />
              ) : (
                <div className="text-sm text-[#f5f5f7]/90 leading-relaxed font-text">{ann.message}</div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {editingId === ann.id ? (
                <>
                  <button
                    onClick={() => handleUpdate(ann.id)}
                    disabled={loading}
                    className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2.5 text-[#f5f5f7]/40 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(ann.id);
                      setEditText(ann.message);
                    }}
                    className="p-2.5 text-[#0071e3] hover:bg-[#0071e3]/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-2.5 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Megaphone className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-text">No active announcements</p>
          </div>
        )}
      </div>
    </div>
  );
}
