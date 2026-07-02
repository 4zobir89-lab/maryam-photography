"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Loader2,
  ChevronDown,
  Calendar,
  Clock,
  User,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Toast } from "@/components/admin/Fields";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { timeAgo } from "@/lib/timeAgo";

type Booking = {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string | null;
  location: string;
  message: string;
  status: string;
  createdAt: string;
};

const serviceOptions: { id: string; labelAr: string }[] = [
  { id: "wedding", labelAr: "تصوير أعراس" },
  { id: "portrait", labelAr: "بورتريه فردي" },
  { id: "commercial", labelAr: "تصوير تجاري" },
  { id: "workshop", labelAr: "ورش عمل" },
  { id: "other", labelAr: "أخرى" },
];

const statusOptions: { id: string; labelAr: string; color: string }[] = [
  { id: "all", labelAr: "الكل", color: "border-border text-muted-foreground" },
  { id: "new", labelAr: "جديد", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  { id: "confirmed", labelAr: "مؤكد", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  { id: "completed", labelAr: "مكتمل", color: "bg-primary/15 text-primary border-primary/30" },
  { id: "cancelled", labelAr: "ملغي", color: "bg-red-500/15 text-red-300 border-red-500/30" },
];

function serviceLabel(id: string): string {
  return serviceOptions.find((s) => s.id === id)?.labelAr ?? id;
}

function statusBadge(status: string) {
  const opt = statusOptions.find((s) => s.id === status);
  if (!opt) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wide font-medium border ${opt.color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {opt.labelAr}
    </span>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const load = (statusFilter = filter) => {
    setLoading(true);
    const url =
      statusFilter === "all"
        ? "/api/bookings"
        : `/api/bookings?status=${statusFilter}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFilter = (s: string) => {
    setFilter(s);
    load(s);
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      showToast("تم تحديث حالة الحجز");
    } catch {
      showToast("فشل التحديث");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/bookings/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast("تم حذف الحجز");
    } catch {
      showToast("فشل الحذف");
    } finally {
      setDeleteTarget(null);
    }
  };

  const buildWhatsAppUrl = (b: Booking): string => {
    const phone = (b.phone || "").replace(/[^+\d]/g, "");
    const serviceAr = serviceLabel(b.service);
    const dateStr = b.preferredDate
      ? new Date(b.preferredDate).toLocaleDateString("ar-EG")
      : "—";
    const text = encodeURIComponent(
      `السلام عليكم ${b.name}،\nهذه مريم — بخصوص حجزك لجلسة ${serviceAr} بتاريخ ${dateStr}.`
    );
    return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  const counts = statusOptions
    .filter((s) => s.id !== "all")
    .map((s) => ({
      ...s,
      count: bookings.filter((b) => b.status === s.id).length,
    }));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2 flex items-center gap-2">
          <CalendarCheck className="w-3.5 h-3.5" />
          Bookings
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          طلبات <span className="text-gold-gradient">الحجوزات</span>
        </h1>
        <p className="text-muted-foreground">
          استعرض طلبات الحجز الواردة من الموقع، حدّث الحالة، أو تواصل مع العميل عبر
          WhatsApp مباشرة.
        </p>
      </motion.div>

      {/* Status counts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {counts.map((c) => (
          <button
            key={c.id}
            onClick={() => changeFilter(c.id)}
            className={`relative p-4 bg-card border rounded-sm text-right transition-all ${
              filter === c.id
                ? "border-primary/50"
                : "border-border/60 hover:border-primary/30"
            }`}
          >
            <div className="font-display text-2xl text-foreground font-bold mb-1">
              {loading ? "—" : c.count}
            </div>
            <div className="text-xs text-muted-foreground tracking-wide flex items-center justify-between">
              <span>{c.labelAr}</span>
              <span
                className={`w-2 h-2 rounded-full ${c.color
                  .replace("bg-", "bg-")
                  .split(" ")[0]}`}
              />
            </div>
          </button>
        ))}
      </motion.div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {statusOptions.map((s) => (
            <button
              key={s.id}
              onClick={() => changeFilter(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === s.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {s.labelAr}
            </button>
          ))}
        </div>
        <button
          onClick={() => load()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border/60 rounded-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-primary/60" />
            </div>
            <p className="font-amiri text-xl text-foreground mb-2">
              لا توجد طلبات حجز
            </p>
            <p className="text-sm text-muted-foreground">
              {filter !== "all"
                ? "لا توجد طلبات بهذه الحالة. جرّب فلترًا آخر."
                : "ستظهر هنا طلبات الحجز الواردة من صفحة الحجز."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {bookings.map((b, i) => {
              const expanded = expandedId === b.id;
              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  className="bg-card border border-border/60 rounded-sm overflow-hidden"
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : b.id)}
                    className="w-full p-4 flex items-center gap-4 text-right hover:bg-background/40 transition-colors"
                  >
                    {/* Index / status dot */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="font-inter text-[10px] text-primary">
                        {String(b.id).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Name + service */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-amiri text-lg text-foreground truncate">
                          {b.name}
                        </span>
                        {b.status === "new" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{serviceLabel(b.service)}</span>
                        <span>·</span>
                        <span dir="ltr">{b.phone}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="hidden md:flex flex-col items-end text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(b.preferredDate)}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground/60 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo(b.createdAt)}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="hidden sm:block">{statusBadge(b.status)}</div>

                    {/* Expand caret */}
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded panel */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-border/40"
                      >
                        <div className="p-5 grid md:grid-cols-3 gap-5">
                          {/* Contact info */}
                          <div className="space-y-3">
                            <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-inter mb-1">
                              معلومات التواصل
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-foreground">{b.name}</span>
                            </div>
                            <a
                              href={`tel:${b.phone.replace(/[^+\d]/g, "")}`}
                              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                              dir="ltr"
                            >
                              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-foreground">{b.phone}</span>
                            </a>
                            {b.email && (
                              <a
                                href={`mailto:${b.email}`}
                                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                dir="ltr"
                              >
                                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-foreground">{b.email}</span>
                              </a>
                            )}
                            {b.location && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-foreground">{b.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Booking details */}
                          <div className="space-y-3">
                            <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-inter mb-1">
                              تفاصيل الحجز
                            </div>
                            <div className="text-sm">
                              <div className="text-muted-foreground text-xs mb-0.5">
                                نوع الخدمة
                              </div>
                              <div className="text-foreground font-medium">
                                {serviceLabel(b.service)}
                              </div>
                            </div>
                            <div className="text-sm">
                              <div className="text-muted-foreground text-xs mb-0.5">
                                التاريخ المفضل
                              </div>
                              <div className="text-foreground">
                                {formatDate(b.preferredDate)}
                              </div>
                            </div>
                            <div className="text-sm">
                              <div className="text-muted-foreground text-xs mb-0.5">
                                تاريخ الطلب
                              </div>
                              <div className="text-foreground">
                                {new Date(b.createdAt).toLocaleString("ar-EG")}
                              </div>
                            </div>
                          </div>

                          {/* Message + actions */}
                          <div className="space-y-3">
                            <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-inter mb-1">
                              إجراءات
                            </div>
                            {b.message && (
                              <div className="p-3 bg-background/40 border border-border/40 rounded-sm">
                                <div className="text-muted-foreground text-xs mb-1">
                                  رسالة العميل
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">
                                  {b.message}
                                </p>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={buildWhatsAppUrl(b)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-300 border border-green-500/30 rounded-sm text-xs hover:bg-green-600/30 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                              {b.status !== "confirmed" && (
                                <button
                                  onClick={() => updateStatus(b.id, "confirmed")}
                                  disabled={updatingId === b.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 text-green-300 border border-green-500/30 rounded-sm text-xs hover:bg-green-500/25 transition-colors disabled:opacity-50"
                                >
                                  {updatingId === b.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  تأكيد
                                </button>
                              )}
                              {b.status !== "completed" && (
                                <button
                                  onClick={() => updateStatus(b.id, "completed")}
                                  disabled={updatingId === b.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary border border-primary/30 rounded-sm text-xs hover:bg-primary/25 transition-colors disabled:opacity-50"
                                >
                                  {updatingId === b.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  إكمال
                                </button>
                              )}
                              {b.status !== "cancelled" && (
                                <button
                                  onClick={() => updateStatus(b.id, "cancelled")}
                                  disabled={updatingId === b.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-sm text-xs hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  إلغاء
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteTarget(b)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-300 border border-red-500/30 rounded-sm text-xs hover:bg-red-500/25 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <Toast message={toast} type={toast.includes("فشل") ? "error" : "success"} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف الحجز"
        message={`هل أنت متأكد من حذف طلب الحجز من "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
