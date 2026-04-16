"use client";

import { useState, useEffect } from "react";
import { Check, X, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import type { Announcement } from "@/types";

export function AnnouncementManager() {
  const { user } = useAuth();
  if (user?.role !== "admin") return null;

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
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white uppercase italic">
        Announcements
      </h2>

      {/* New announcement */}
      <div className="flex gap-2">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter announcement message..."
          className="flex-1 h-16 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={handleCreate}
          disabled={loading || !newMessage.trim()}
          className="px-6 h-16 bg-cyan-600 text-white font-bold rounded-2xl hover:bg-cyan-500 disabled:opacity-50 self-end"
        >
          Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-4 rounded-2xl border border-white/5 bg-slate-900/40 flex items-start gap-4"
          >
            <div className="flex-1">
              {editingId === ann.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-20 bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white resize-none"
                  autoFocus
                />
              ) : (
                <div className="text-sm text-white">{ann.message}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {editingId === ann.id ? (
                <>
                  <button
                    onClick={() => handleUpdate(ann.id)}
                    disabled={loading}
                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-slate-400 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(ann.id);
                      setEditText(ann.message);
                    }}
                    className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
