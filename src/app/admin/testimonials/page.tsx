"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Upload,
  Image as ImageIcon,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { Toast } from "@/components/admin/Fields";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatFileSize } from "@/lib/imageCompress";

type Testimonial = {
  id: number;
  quoteAr: string;
  nameAr: string;
  roleAr: string;
  roleEn: string;
  rating: number;
  avatar: string;
  imageData: string; // Vercel Blob URL — screenshot/photo of client's message
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

  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDeleteTarget, setImageDeleteTarget] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/testimonials?all=1")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3500);
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
      imageData: "",
      order: items.length + 1,
      published: true,
    });
  };

  // ===== Image upload =====
  const handleImageUpload = async (file: File) => {
    if (!editing) return;
    if (!file.type.startsWith("image/")) {
      showToast("الملف ليس صورة صالحة");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast("حجم الصورة كبير جداً (الحد الأقصى 25 ميجابايت)");
      return;
    }
    setImageUploading(true);
    try {
      showToast(`جاري رفع الصورة (${formatFileSize(file.size)})...`);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setEditing({ ...editing, imageData: data.url });
      showToast(`✓ تم رفع الصورة بنجاح`);
    } catch (err) {
      console.error("Image upload error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل رفع الصورة: ${msg}`);
    } finally {
      setImageUploading(false);
    }
  };

  // ===== Image delete (from Blob + DB) =====
  const removeImage = async () => {
    if (!imageDeleteTarget || !editing) return;
    const oldUrl = editing.imageData;
    setEditing({ ...editing, imageData: "" });
    try {
      if (editing.id !== 0) {
        const res = await fetch(`/api/testimonials/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: "" }),
        });
        if (!res.ok) throw new Error("فشل");
        if (oldUrl && oldUrl.includes("vercel-storage.com")) {
          await fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: oldUrl }),
          }).catch(() => {});
        }
        setItems(items.map((t) => (t.id === editing.id ? { ...t, imageData: "" } : t)));
      }
      showToast("تم حذف الصورة ✓");
    } catch (err) {
      console.error("Image delete error:", err);
      setEditing({ ...editing, imageData: oldUrl });
      showToast("خطأ في حذف الصورة");
    } finally {
      setImageDeleteTarget(null);
    }
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

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/testimonials/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل");
      setItems(items.filter((t) => t.id !== deleteTarget.id));
      showToast("تم حذف الرأي ✓");
    } catch {
      showToast("خطأ في الحذف");
    } finally {
      setDeleteTarget(null);
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
      {/* Header */}
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
            أضيفي وعدّلي شهادات العملاء — النص، الاسم، التقييم، الصورة، والحالة.
          </p>
        </div>
        <button
          onClick={startNew}
          className="group flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          إضافة رأي
        </button>
      </motion.div>

      {/* Feature hint banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-l from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-sm p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-amiri text-lg text-foreground mb-1">
              ✦ ميزة جديدة: صور توثيق الشهادات
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              يمكنك الآن رفع لقطة شاشة من رسالة العميل (واتساب/إنستغرام) كدليل على رأيه الحقيقي.
              ستظهر الصورة في الموقع بدل الأحرف الافتراضية، ويمكن للزوار الضغط عليها لرؤيتها بالحجم الكامل.
            </p>
          </div>
        </div>
      </motion.div>

      {/* List view */}
      <div className="grid sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="group relative bg-card border border-border/60 rounded-sm overflow-hidden hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Top: avatar/image + name */}
              <div className="p-5 flex items-start gap-4">
                {/* Avatar or Image */}
                {t.imageData ? (
                  <button
                    onClick={() => setPreviewImage(t.imageData)}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/40 hover:border-primary transition-all shrink-0 group/avatar"
                    aria-label="عرض الصورة بالحجم الكامل"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.imageData}
                      alt={t.nameAr}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover/avatar:bg-background/40 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-primary opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                    </div>
                    {/* Verified badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="font-amiri text-xl text-gold-gradient">
                      {t.avatar || t.nameAr.slice(0, 2)}
                    </span>
                  </div>
                )}

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <div className="font-amiri text-lg text-foreground truncate">
                        {t.nameAr || "بدون اسم"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.roleAr}
                        {t.roleEn && <span className="opacity-60"> · {t.roleEn}</span>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full shrink-0 ${
                        t.published
                          ? "bg-green-600/20 text-green-400 border border-green-500/30"
                          : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {t.published ? "منشور" : "مخفي"}
                    </span>
                  </div>
                  <Stars count={t.rating} />
                </div>
              </div>

              {/* Quote preview */}
              <div className="px-5 pb-3">
                <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
                  &ldquo;{t.quoteAr || "—"}&rdquo;
                </p>
              </div>

              {/* Image thumbnail strip (if has image) */}
              {t.imageData && (
                <div className="px-5 pb-3">
                  <button
                    onClick={() => setPreviewImage(t.imageData)}
                    className="flex items-center gap-2 text-[10px] text-primary/70 hover:text-primary transition-colors group/img"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>لديها صورة توثيق — اضغط للعرض</span>
                    <Maximize2 className="w-3 h-3 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 px-5 py-3 border-t border-border/40 bg-background/30">
                <button
                  onClick={() => setEditing({ ...t })}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-sm hover:border-primary/40 hover:text-primary text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  تعديل
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="flex items-center justify-center w-9 h-9 border border-border rounded-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          لا توجد آراء بعد. اضغطي &ldquo;إضافة رأي&rdquo; للبدء.
        </div>
      )}

      {/* ===== Editor modal ===== */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto p-6 md:p-10">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/80 backdrop-blur py-3 -mx-6 px-6 md:-mx-10 md:px-10 z-10 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-amiri text-2xl text-foreground">
                    {editing.id === 0 ? "إضافة رأي جديد" : "تعديل الرأي"}
                  </h2>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* ===== Quote ===== */}
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
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-none text-foreground leading-relaxed"
                  />
                </div>

                {/* ===== Image upload (NEW) ===== */}
                <div className="bg-card border border-primary/30 rounded-sm p-5 relative overflow-hidden">
                  {/* Decorative gradient */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase font-inter">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      صورة توثيق الشهادة
                    </label>
                    {editing.imageData && (
                      <span className="text-[10px] text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        صورة مرفوعة
                      </span>
                    )}
                  </div>

                  {editing.imageData ? (
                    <div className="space-y-3">
                      <div className="relative group overflow-hidden rounded-md border border-border/60 max-w-xs mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editing.imageData}
                          alt="صورة الشهادة"
                          className="w-full max-h-64 object-contain bg-background/40"
                        />
                        <button
                          onClick={() => setPreviewImage(editing.imageData)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          aria-label="عرض كامل"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur px-2 py-0.5 rounded-full text-[10px] text-primary border border-primary/30 flex items-center gap-1">
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          موثّقة
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          تبديل الصورة
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f);
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        {editing.id !== 0 && (
                          <button
                            onClick={() => setImageDeleteTarget(editing)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-xs font-medium hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            حذف الصورة
                          </button>
                        )}
                      </div>
                    </div>
                  ) : imageUploading ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/50 rounded-md p-10 bg-primary/5">
                      <Loader2 className="w-10 h-10 text-primary mb-3 animate-spin" />
                      <span className="text-sm text-primary mb-1">جاري رفع الصورة...</span>
                      <span className="text-xs text-muted-foreground/70">
                        يتم الحفظ بدقة كاملة عبر Vercel Blob
                      </span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm text-foreground mb-1 font-medium">
                        اضغطي لرفع صورة الشهادة
                      </span>
                      <span className="text-xs text-muted-foreground/70 text-center mb-2 max-w-xs">
                        لقطة شاشة من رسالة العميل في واتساب أو إنستغرام
                      </span>
                      <span className="text-[10px] text-primary/60 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        PNG · JPG · WebP — حتى 25 ميجابايت
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground/70 mt-3 leading-relaxed">
                    💡 رفع لقطة شاشة من محادثة العميل يضيف مصداقية للشهادة.
                    ستظهر الصورة في الموقع بدل الأحرف الافتراضية مع علامة &ldquo;موثّقة&rdquo;.
                  </p>
                </div>

                {/* ===== Name & roles ===== */}
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

                {/* ===== Rating + avatar (fallback) ===== */}
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
                  {!editing.imageData && (
                    <div className="pt-4 border-t border-border/40">
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
                        تظهر هذه الأحرف عند عدم وجود صورة.
                      </p>
                    </div>
                  )}
                </div>

                {/* ===== Published + order ===== */}
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

                {/* ===== Save bar ===== */}
                <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur p-4 -mx-6 md:-mx-10 border-t border-border">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-5 py-2.5 border border-border text-muted-foreground rounded-sm hover:text-foreground transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Image preview lightbox ===== */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 left-4 w-12 h-12 rounded-full border border-border bg-background/60 backdrop-blur flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors z-10"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="شهادة العميل"
                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-primary/20"
              />
              <p className="text-center text-xs text-muted-foreground mt-4 font-inter tracking-widest uppercase">
                ✦ شهادة عميل موثّقة ✦
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Confirm dialogs ===== */}
      <ConfirmDialog
        open={imageDeleteTarget !== null}
        title="حذف صورة الشهادة"
        message="هل أنت متأكدة من حذف هذه الصورة؟ سيتم حذفها من التخزين السحابي أيضًا."
        confirmText="حذف الصورة"
        danger
        onConfirm={removeImage}
        onCancel={() => setImageDeleteTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="حذف الرأي"
        message={`هل أنت متأكدة من حذف رأي "${deleteTarget?.nameAr || ""}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف نهائي"
        danger
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast message={toast} />
    </div>
  );
}
