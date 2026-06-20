"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Loader2,
  Save,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { Toast } from "@/components/admin/Fields";

type Testimonial = {
  id: number;
  quoteAr: string;
  nameAr: string;
  roleAr: string;
  roleEn: string;
  rating: number; // 1-5
  avatar: string; // letters like "أ س"
  order: number;
  published: boolean;
};

function Stars({
  count,
  onClick,
  size = "w-4 h-4",
}: {
  count: number;
  onClick?: (n: number) => void;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onClick}
          onClick={() => onClick?.(n)}
          className={`${onClick ? "cursor-pointer" : "cursor-default"} ${onClick ? "hover:scale-110 transition-transform" : ""}`}
          aria-label={`${n} نجوم`}
        >
          <Star
            className={`${size} ${
              n <= count
                ? "text-primary fill-primary"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/testimonials?all=1")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const startNew = () => {
    setEditing({
      id: 0,
      quoteAr: "",
      nameAr: "",
      roleAr: "",
      roleEn: "",
      rating: 5,
      avatar: "",
      order: items.length + 1,
      published: true,
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.quoteAr.trim()) {
      showToast("نص الرأي مطلوب");
      return;
    }
    if (!editing.nameAr.trim()) {
      showToast("اسم العميل مطلوب");
      return;
    }
    setSaving(true);
    try {
      const method = editing.id === 0 ? "POST" : "PUT";
      const url =
        editing.id === 0
          ? "/api/testimonials"
          : `/api/testimonials/${editing.id}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error("فشل");
      const saved: Testimonial = await res.json();
      if (editing.id === 0) {
        setItems([...items, saved]);
      } else {
        setItems(items.map((t) => (t.id === saved.id ? saved : t)));
      }
      setEditing(null);
      showToast("تم الحفظ بنجاح ✓");
    } catch {
      showToast("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الرأي؟")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل");
      setItems(items.filter((t) => t.id !== id));
      showToast("تم الحذف");
    } catch {
      showToast("خطأ في الحذف");
    }
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
            Testimonials Management
          </div>
          <h1 className="font-amiri text-4xl text-foreground mb-2">
            إدارة آراء العملاء
          </h1>
          <p className="text-muted-foreground">
            أضيفي وعدّلي شهادات العملاء — النص، الاسم، التقييم، والحالة.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة رأي
        </button>
      </motion.div>

      {/* List view */}
      <div className="space-y-3">
        {items.map((t) => (
          <div
            key={t.id}
            className="bg-card border border-border/60 rounded-sm p-5 flex items-start gap-4"
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="font-amiri text-xl text-primary">
                {t.avatar || t.nameAr.slice(0, 2)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <div className="font-amiri text-lg text-foreground">
                    {t.nameAr || "بدون اسم"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.roleAr}
                    {t.roleEn && <span className="opacity-60"> · {t.roleEn}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full ${
                      t.published
                        ? "bg-green-600/80 text-white"
                        : "bg-gray-600/80 text-white"
                    }`}
                  >
                    {t.published ? "منشور" : "مخفي"}
                  </span>
                </div>
              </div>
              <Stars count={t.rating} />
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {t.quoteAr || "—"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditing({ ...t })}
                className="flex items-center justify-center w-9 h-9 border border-border rounded-sm hover:border-primary/40 hover:text-primary transition-colors"
                aria-label="تعديل"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(t.id)}
                className="flex items-center justify-center w-9 h-9 border border-border rounded-sm text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          لا توجد آراء بعد. اضغطي "إضافة رأي" للبدء.
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-amiri text-3xl text-foreground">
                {editing.id === 0 ? "إضافة رأي جديد" : "تعديل الرأي"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Quote */}
              <div className="bg-card border border-border/60 rounded-sm p-5">
                <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                  نص الرأي *
                </label>
                <textarea
                  value={editing.quoteAr}
                  onChange={(e) =>
                    setEditing({ ...editing, quoteAr: e.target.value })
                  }
                  rows={4}
                  placeholder="اكتبي نص شهادة العميل هنا..."
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Name & roles */}
              <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    اسم العميل *
                  </label>
                  <input
                    value={editing.nameAr}
                    onChange={(e) =>
                      setEditing({ ...editing, nameAr: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الدور (عربي)
                    </label>
                    <input
                      value={editing.roleAr}
                      onChange={(e) =>
                        setEditing({ ...editing, roleAr: e.target.value })
                      }
                      placeholder="مثال: عروس"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الدور (إنجليزي)
                    </label>
                    <input
                      value={editing.roleEn}
                      onChange={(e) =>
                        setEditing({ ...editing, roleEn: e.target.value })
                      }
                      placeholder="مثال: Bride"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Rating + avatar */}
              <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-3 font-inter">
                    التقييم
                  </label>
                  <Stars
                    count={editing.rating}
                    onClick={(n) => setEditing({ ...editing, rating: n })}
                    size="w-7 h-7"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    الأحرف (Avatar) — حرفين كحد أقصى
                  </label>
                  <input
                    value={editing.avatar}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        avatar: e.target.value.slice(0, 2),
                      })
                    }
                    placeholder="مثال: أ س"
                    className="w-24 px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary text-center font-amiri text-lg"
                  />
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    تظهر هذه الأحرف داخل دائرة الأفاتار.
                  </p>
                </div>
              </div>

              {/* Published toggle + order */}
              <div className="bg-card border border-border/60 rounded-sm p-5 grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setEditing({
                      ...editing,
                      published: !editing.published,
                    })
                  }
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-sm border transition-colors ${
                    editing.published
                      ? "bg-green-600/10 border-green-500/50 text-green-300"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {editing.published ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  {editing.published ? "منشور" : "مخفي"}
                </button>
                <div className="flex items-center gap-2 justify-center">
                  <label className="text-xs text-muted-foreground">الترتيب:</label>
                  <input
                    type="number"
                    value={editing.order}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-16 px-2 py-1.5 bg-background/50 border border-border rounded-sm text-center"
                  />
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur p-4 -mx-6 md:-mx-10 border-t border-border">
                <button
                  onClick={() => setEditing(null)}
                  className="px-5 py-2.5 border border-border text-muted-foreground rounded-sm hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  حفظ الرأي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}
