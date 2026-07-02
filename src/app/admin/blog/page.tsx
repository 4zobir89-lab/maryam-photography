"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Upload,
  Loader2,
  Save,
  Star,
  Eye,
  EyeOff,
  Search,
  PenSquare,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Toast } from "@/components/admin/Fields";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatFileSize } from "@/lib/imageCompress";

type BlogPost = {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string;
  category: string;
  tags: string;
  readTime: number;
  featured: boolean;
  published: boolean;
  author: string;
  order: number;
  createdAt: string;
};

const categories = [
  { id: "general", labelAr: "عام" },
  { id: "tutorials", labelAr: "شروحات" },
  { id: "stories", labelAr: "قصص" },
  { id: "gear", labelAr: "العتاد" },
  { id: "behind-the-scenes", labelAr: "كواليس" },
];

function categoryLabel(id: string): string {
  return categories.find((c) => c.id === id)?.labelAr ?? id;
}

// Generate a URL-safe slug from an English title (same logic as server route)
function generateSlug(titleEn: string): string {
  return (titleEn || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Calculate reading time (words / 200, min 1)
function calcReadTime(content: string): number {
  const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const emptyPost = (): BlogPost => ({
  id: 0,
  titleAr: "",
  titleEn: "",
  slug: "",
  excerptAr: "",
  excerptEn: "",
  contentAr: "",
  contentEn: "",
  coverImage: "",
  category: "general",
  tags: "",
  readTime: 5,
  featured: false,
  published: true,
  author: "Maryam",
  order: 0,
  createdAt: new Date().toISOString(),
});

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [coverDeleteTarget, setCoverDeleteTarget] = useState<BlogPost | null>(
    null
  );
  // slug "touched" — if user manually edited, don't auto-regenerate
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    fetch("/api/blog?all=1")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const startNew = () => {
    setEditing(emptyPost());
    setSlugTouched(false);
  };

  const openEditor = (p: BlogPost) => {
    setEditing({ ...p });
    setSlugTouched(true); // Don't overwrite existing slug when editing
  };

  // Sync slug from titleEn (only if slug not manually edited)
  const updateTitleEn = (titleEn: string) => {
    if (!editing) return;
    const next = { ...editing, titleEn };
    if (!slugTouched) {
      next.slug = generateSlug(titleEn);
    }
    setEditing(next);
  };

  const updateContentAr = (contentAr: string) => {
    if (!editing) return;
    // Auto-calc readTime as user types
    setEditing({ ...editing, contentAr, readTime: calcReadTime(contentAr) });
  };

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
      showToast(`جاري رفع صورة الغلاف (${formatFileSize(file.size)})...`);
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
      setEditing({ ...editing, coverImage: data.url });
      showToast(`✓ تم رفع صورة الغلاف (${formatFileSize(file.size)})`);
    } catch (err) {
      console.error("Cover upload error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل رفع الصورة: ${msg}`);
    } finally {
      setImageUploading(false);
    }
  };

  const removeCoverImage = async () => {
    if (!coverDeleteTarget || !editing) return;
    const oldUrl = editing.coverImage;
    setEditing({ ...editing, coverImage: "" });
    // If post is already saved, PUT to server; otherwise just clear UI
    if (editing.id !== 0) {
      try {
        const res = await fetch(`/api/blog/${editing.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImage: "" }),
        });
        if (!res.ok) throw new Error("فشل");
        if (oldUrl && oldUrl.includes("vercel-storage.com")) {
          await fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: oldUrl }),
          });
        }
        setPosts(
          posts.map((p) =>
            p.id === editing.id ? { ...p, coverImage: "" } : p
          )
        );
        showToast("تم حذف صورة الغلاف ✓");
      } catch (err) {
        console.error("Cover delete error:", err);
        setEditing({ ...editing, coverImage: oldUrl });
        showToast("خطأ في حذف الصورة");
      }
    } else {
      // New unsaved post — just delete the blob directly
      if (oldUrl && oldUrl.includes("vercel-storage.com")) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: oldUrl }),
        });
      }
      showToast("تم حذف صورة الغلاف ✓");
    }
    setCoverDeleteTarget(null);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titleAr.trim()) {
      showToast("العنوان بالعربية مطلوب");
      return;
    }
    if (!editing.titleEn.trim()) {
      showToast("العنوان بالإنجليزية مطلوب (يُستخدم لتوليد الرابط)");
      return;
    }
    setSaving(true);
    try {
      const isNew = editing.id === 0;
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/blog" : `/api/blog/${editing.slug}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const saved = await res.json();
      if (isNew) {
        setPosts([saved, ...posts]);
      } else {
        // The slug may have changed on save — remove old, add new
        setPosts(
          posts.map((p) => (p.id === saved.id ? saved : p))
        );
      }
      setEditing(null);
      showToast("تم حفظ المقال بنجاح ✓");
    } catch (err) {
      console.error("Save error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      if (msg.includes("401")) {
        showToast("انتهت الجلسة. سجّلي الدخول مجدداً.");
      } else {
        showToast(`خطأ في الحفظ: ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/blog/${deleteTarget.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setPosts(posts.filter((p) => p.id !== deleteTarget.id));
      showToast("تم حذف المقال ✓");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("خطأ في الحذف");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Filtered view
  const filteredPosts = posts.filter((p) => {
    const matchesCategory =
      filterCategory === "all" || p.category === filterCategory;
    if (!matchesCategory) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.titleAr.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.tags.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
            Blog Management
          </div>
          <h1 className="font-amiri text-4xl text-foreground mb-2">
            إدارة <span className="text-gold-gradient">المدوّنة</span>
          </h1>
          <p className="text-muted-foreground">
            أضيفي وعدّلي مقالاتك. اكتبتي بالعربية مع دعم Markdown. كل مقال له
            رابط فريد (slug) وصورة غلاف.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          مقال جديد
        </button>
      </motion.div>

      {/* Search + filter */}
      <div className="bg-card border border-border/60 rounded-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحثي بالعنوان أو الوسوم..."
            className="w-full pr-10 pl-3 py-2.5 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary text-sm min-w-[160px]"
        >
          <option value="all">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.labelAr}
            </option>
          ))}
        </select>
      </div>

      {/* Posts list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((p) => (
          <div
            key={p.id}
            className="bg-card border border-border/60 rounded-sm overflow-hidden group flex flex-col"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-[oklch(0.2_0.02_285)] to-[oklch(0.1_0.005_285)] overflow-hidden">
              {p.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.coverImage}
                  alt={p.titleAr}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.22 0.04 285), oklch(0.14 0.01 75))",
                  }}
                >
                  <PenSquare className="w-8 h-8 text-primary/30" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {p.featured && (
                  <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    مميز
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full ${
                    p.published
                      ? "bg-green-600/80 text-white"
                      : "bg-gray-600/80 text-white"
                  }`}
                >
                  {p.published ? "منشور" : "مخفي"}
                </span>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-background/70 backdrop-blur-sm border border-border/60 text-foreground/80 px-2 py-0.5 text-[10px] rounded-full">
                  {categoryLabel(p.category)}
                </span>
              </div>
            </div>
            {/* Body */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="font-amiri text-lg text-foreground mb-1 line-clamp-2">
                {p.titleAr || "بدون عنوان"}
              </div>
              <div className="font-display text-xs text-muted-foreground mb-2 line-clamp-1" dir="ltr">
                /{p.slug}
              </div>
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.readTime} د
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(p.createdAt).toLocaleDateString("ar")}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-2">
                <button
                  onClick={() => openEditor(p)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-sm hover:border-primary/40 hover:text-primary text-sm transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  تعديل
                </button>
                <Link
                  href={`/blog/${p.slug}`}
                  target="_blank"
                  className="p-2 border border-border rounded-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  title="عرض المقال"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="p-2 border border-border rounded-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          {posts.length === 0 ? (
            <>
              <PenSquare className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              لا توجد مقالات بعد. اضغطي &quot;مقال جديد&quot; لكتابة أول تدوينة.
            </>
          ) : (
            "لا توجد نتائج مطابقة لبحثك."
          )}
        </div>
      )}

      {/* ===== Editor modal ===== */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/80 backdrop-blur py-2 -mx-6 px-6 md:-mx-10 md:px-10 z-10">
              <h2 className="font-amiri text-3xl text-foreground">
                {editing.id === 0 ? "مقال جديد" : "تعديل المقال"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 pb-24">
              {/* Cover image upload */}
              <div className="bg-card border border-border/60 rounded-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase font-inter">
                    صورة الغلاف
                  </label>
                  {editing.coverImage && (
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      صورة مرفوعة
                    </span>
                  )}
                </div>

                {editing.coverImage ? (
                  <div className="space-y-3">
                    <div className="relative group overflow-hidden rounded-md border border-border/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editing.coverImage}
                        alt="cover preview"
                        loading="lazy"
                        decoding="async"
                        className="w-full max-h-[320px] object-cover bg-background/40"
                      />
                      <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] text-primary border border-primary/30">
                        الغلاف الحالي
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        تبديل الصورة
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleImageUpload(f);
                          }}
                        />
                      </label>
                      <button
                        onClick={() => setCoverDeleteTarget(editing)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-xs font-medium hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف الصورة
                      </button>
                    </div>
                  </div>
                ) : imageUploading ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/50 rounded-md p-12 bg-primary/5">
                    <Loader2 className="w-10 h-10 text-primary mb-3 animate-spin" />
                    <span className="text-sm text-primary mb-1">
                      جاري رفع الصورة...
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      يتم الحفظ بدقة كاملة عبر Vercel Blob
                    </span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-12 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm text-foreground mb-1 font-medium">
                      اضغطي لرفع صورة الغلاف
                    </span>
                    <span className="text-xs text-muted-foreground/70 mb-2">
                      PNG, JPG, WebP — حد أقصى 25 ميجابايت
                    </span>
                    <span className="text-[10px] text-primary/60">
                      ✦ تُحفظ بدقة كاملة عبر Vercel Blob
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f);
                      }}
                    />
                  </label>
                )}
                <p className="text-xs text-muted-foreground/70 mt-3">
                  💡 صورة الغلاف اختيارية. ستظهر أعلى المقال وفي بطاقة المقال.
                </p>
              </div>

              {/* Titles + slug */}
              <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      العنوان بالعربية *
                    </label>
                    <input
                      value={editing.titleAr}
                      onChange={(e) =>
                        setEditing({ ...editing, titleAr: e.target.value })
                      }
                      placeholder="مثال: كيف أصوّر الأعراس في الضوء الذهبي"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      العنوان بالإنجليزية *
                    </label>
                    <input
                      value={editing.titleEn}
                      onChange={(e) => updateTitleEn(e.target.value)}
                      placeholder="e.g. Shooting Weddings in Golden Hour"
                      dir="ltr"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary text-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    الرابط (slug)
                  </label>
                  <div className="flex items-stretch">
                    <span className="inline-flex items-center px-3 bg-background/30 border border-border rounded-r-sm text-xs text-muted-foreground font-inter" dir="ltr">
                      /blog/
                    </span>
                    <input
                      value={editing.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setEditing({ ...editing, slug: e.target.value });
                      }}
                      placeholder="auto-generated-from-english-title"
                      dir="ltr"
                      className="flex-1 px-3 py-2 bg-background/50 border border-border border-r-0 rounded-l-sm focus:outline-none focus:border-primary text-left"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1.5">
                    يُولّد تلقائياً من العنوان الإنجليزي. يمكنك تعديله يدوياً.
                  </p>
                </div>
              </div>

              {/* Excerpts */}
              <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      المقتطف (عربي)
                    </label>
                    <textarea
                      value={editing.excerptAr}
                      onChange={(e) =>
                        setEditing({ ...editing, excerptAr: e.target.value })
                      }
                      rows={3}
                      placeholder="ملخص قصير يظهر في بطاقة المقال..."
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      المقتطف (إنجليزي)
                    </label>
                    <textarea
                      value={editing.excerptEn}
                      onChange={(e) =>
                        setEditing({ ...editing, excerptEn: e.target.value })
                      }
                      rows={3}
                      placeholder="Short English excerpt..."
                      dir="ltr"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-none text-sm text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Content (markdown) */}
              <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase font-inter">
                      محتوى المقال (عربي · Markdown)
                    </label>
                    <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {editing.readTime} دقائق قراءة
                    </span>
                  </div>
                  <textarea
                    value={editing.contentAr}
                    onChange={(e) => updateContentAr(e.target.value)}
                    rows={14}
                    placeholder={"# عنوان\n\nاكتبي المقال هنا باستخدام Markdown...\n\n- نقطة أولى\n- نقطة ثانية\n\n> اقتباس"}
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-y text-sm leading-relaxed font-mono"
                  />
                  <p className="text-xs text-muted-foreground/70 mt-1.5">
                    💡 يدعم Markdown: # للعناوين، **للنص العريض**، *للمائل*،
                    &gt; للاقتباس، - للقوائم، [نص](رابط) للروابط. زمن القراءة
                    يُحسب تلقائياً.
                  </p>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    المحتوى (إنجليزي · Markdown) — اختياري
                  </label>
                  <textarea
                    value={editing.contentEn}
                    onChange={(e) =>
                      setEditing({ ...editing, contentEn: e.target.value })
                    }
                    rows={8}
                    placeholder="English markdown content (optional)..."
                    dir="ltr"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-y text-sm text-left font-mono"
                  />
                </div>
              </div>

              {/* Meta: category, tags, author, readTime, order */}
              <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الفئة
                    </label>
                    <select
                      value={editing.category}
                      onChange={(e) =>
                        setEditing({ ...editing, category: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.labelAr} — {c.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الكاتب
                    </label>
                    <input
                      value={editing.author}
                      onChange={(e) =>
                        setEditing({ ...editing, author: e.target.value })
                      }
                      placeholder="Maryam"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    الوسوم (افصل بينها بفاصلة)
                  </label>
                  <input
                    value={editing.tags}
                    onChange={(e) =>
                      setEditing({ ...editing, tags: e.target.value })
                    }
                    placeholder="تصوير, أعراس, شروحات"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      زمن القراءة (دقيقة)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editing.readTime}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          readTime: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={editing.order}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-card border border-border/60 rounded-sm p-5 grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setEditing({ ...editing, featured: !editing.featured })
                  }
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-sm border transition-colors ${
                    editing.featured
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${editing.featured ? "fill-current" : ""}`}
                  />
                  مميز
                </button>
                <button
                  onClick={() =>
                    setEditing({ ...editing, published: !editing.published })
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
                  {editing.published ? "منشور" : "مخفي (مسودة)"}
                </button>
              </div>
            </div>

            {/* Sticky save bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur p-4 border-t border-border z-20">
              <div className="max-w-3xl mx-auto flex items-center justify-end gap-3">
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
                  {saving ? "جاري الحفظ..." : "حفظ المقال"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete post confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف المقال"
        message={
          deleteTarget
            ? `هل أنت متأكدة من حذف المقال "${deleteTarget.titleAr}"؟ سيتم حذف المقال وصورة الغلاف نهائياً، ولا يمكن التراجع.`
            : ""
        }
        confirmText="نعم، احذفي"
        cancelText="إلغاء"
        danger
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Delete cover image confirmation */}
      <ConfirmDialog
        open={!!coverDeleteTarget}
        title="حذف صورة الغلاف"
        message="هل أنت متأكدة من حذف صورة الغلاف؟ سيتم حذفها من التخزين نهائياً ويمكنك رفع صورة جديدة في أي وقت."
        confirmText="نعم، احذفي الصورة"
        cancelText="إبقاء الصورة"
        danger
        onConfirm={removeCoverImage}
        onCancel={() => setCoverDeleteTarget(null)}
      />

      <Toast message={toast} />
    </div>
  );
}
