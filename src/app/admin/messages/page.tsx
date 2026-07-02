"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Phone,
  MessageSquare,
  Inbox,
} from "lucide-react";
import { Toast } from "@/components/admin/Fields";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (!then) return "";
  const diffMs = Date.now() - then;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "قبل لحظات";
  const min = Math.floor(sec / 60);
  if (min < 60) return `قبل ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `قبل ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `قبل ${day} يوم`;
  const month = Math.floor(day / 30);
  if (month < 12) return `قبل ${month} شهر`;
  return `قبل ${Math.floor(month / 12)} سنة`;
}

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "read">("all");
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchMessages = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/contact-messages");
      if (!res.ok) throw new Error("فشل");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      showToast("خطأ في تحميل الرسائل");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("فشل");
      setMessages(messages.map((m) => (m.id === id ? { ...m, status: status as ContactMessage["status"] } : m)));
    } catch {
      showToast("خطأ في التحديث");
    }
  };

  const removeMessage = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/contact-messages/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل");
      setMessages(messages.filter((m) => m.id !== deleteTarget.id));
      showToast("تم حذف الرسالة ✓");
    } catch {
      showToast("خطأ في الحذف");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const stats = {
    total: messages.length,
    new: messages.filter((m) => m.status === "new").length,
    read: messages.filter((m) => m.status === "read").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
            Messages
          </div>
          <h1 className="font-amiri text-4xl text-foreground mb-2">
            رسائل التواصل
          </h1>
          <p className="text-muted-foreground">
            الرسائل المُرسلة عبر نموذج التواصل في الموقع.
          </p>
        </div>
        <button
          onClick={() => fetchMessages()}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-sm hover:border-primary/40 hover:text-primary text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "إجمالي", value: stats.total, color: "text-foreground" },
          { label: "جديدة", value: stats.new, color: "text-yellow-400" },
          { label: "مقروءة", value: stats.read, color: "text-green-400" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-sm p-4 text-center">
            <div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {([
          { id: "all", label: "الكل" },
          { id: "new", label: "جديدة" },
          { id: "read", label: "مقروءة" },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-sm border rounded-sm transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((m, i) => {
            const isExpanded = expandedId === m.id;
            const isNew = m.status === "new";
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className={`bg-card border rounded-sm overflow-hidden transition-colors ${
                  isNew ? "border-yellow-500/40" : "border-border/60"
                }`}
              >
                {/* Top row — always visible */}
                <button
                  onClick={() => {
                    setExpandedId(isExpanded ? null : m.id);
                    if (isNew) updateStatus(m.id, "read");
                  }}
                  className="w-full flex items-start gap-4 p-5 text-right hover:bg-background/30 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isNew ? "bg-yellow-500/15 border border-yellow-500/40" : "bg-primary/10 border border-primary/20"
                  }`}>
                    <Mail className={`w-4 h-4 ${isNew ? "text-yellow-400" : "text-primary"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-amiri text-lg text-foreground">{m.name}</span>
                        {isNew && (
                          <span className="px-2 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                            جديد
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-inter">{timeAgo(m.createdAt)}</span>
                    </div>
                    <p className={`text-sm text-muted-foreground leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                      {m.message}
                    </p>
                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/70 flex-wrap">
                      {m.phone && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3" />
                          {m.phone}
                        </span>
                      )}
                      {m.email && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Mail className="w-3 h-3" />
                          {m.email}
                        </span>
                      )}
                      {m.service && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {m.service}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded actions */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border/40 overflow-hidden"
                    >
                      <div className="p-4 flex items-center justify-between gap-2 flex-wrap bg-background/30">
                        {/* WhatsApp link */}
                        {m.phone && (
                          <a
                            href={`https://wa.me/${m.phone.replace(/[^+\d]/g, "")}?text=${encodeURIComponent(`السلام عليكم ${m.name}، شكرًا لتواصلك معي بخصوص ${m.service}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-sm text-xs hover:bg-green-500/20 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            الرد عبر WhatsApp
                          </a>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStatus(m.id, m.status === "archived" ? "read" : "archived")}
                            className="flex items-center gap-2 px-3 py-2 border border-border text-muted-foreground rounded-sm text-xs hover:text-foreground transition-colors"
                          >
                            {m.status === "archived" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {m.status === "archived" ? "إظهار" : "أرشفة"}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="flex items-center gap-2 px-3 py-2 border border-border text-red-400 rounded-sm text-xs hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            حذف
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {messages.length === 0 ? "لا توجد رسائل بعد." : "لا توجد رسائل مطابقة."}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="حذف الرسالة"
        message={`هل أنت متأكدة من حذف رسالة "${deleteTarget?.name || ""}"؟`}
        confirmText="حذف"
        danger
        onConfirm={removeMessage}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast message={toast} />
    </div>
  );
}
