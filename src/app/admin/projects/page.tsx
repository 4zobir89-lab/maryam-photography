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
} from "lucide-react";
import { Toast } from "@/components/admin/Fields";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatFileSize } from "@/lib/imageCompress";

type Project = {
  id: number;
  titleAr: string;
  titleEn: string;
  category: string;
  year: string;
  location: string;
  description: string;
  imageData: string;
  palette1: string;
  palette2: string;
  palette3: string;
  motif: string;
  span: string;
  featured: boolean;
  order: number;
  published: boolean;
};

type GalleryImage = {
  id: number;
  projectId: number;
  url: string;
  caption: string;
  order: number;
};

const categories = [
  { id: "weddings", labelAr: "أعراس" },
  { id: "portraits", labelAr: "بورتريه" },
  { id: "culture", labelAr: "ثقافة" },
  { id: "landscapes", labelAr: "مناظر" },
];

const motifs = [
  "bride",
  "mountain",
  "face",
  "city",
  "desert",
  "tower",
  "wave",
  "tree",
];

const spans = [
  { id: "normal", labelAr: "عادي" },
  { id: "wide", labelAr: "عريض" },
  { id: "tall", labelAr: "طويل" },
];

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Gallery state (only relevant while editing an existing project)
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    fetch("/api/projects?all=1")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const startNew = () => {
    setEditing({
      id: 0,
      titleAr: "",
      titleEn: "",
      category: "weddings",
      year: new Date().getFullYear().toString(),
      location: "",
      description: "",
      imageData: "",
      palette1: "oklch(0.4 0.1 40)",
      palette2: "oklch(0.2 0.05 285)",
      palette3: "oklch(0.78 0.13 75)",
      motif: "bride",
      span: "normal",
      featured: false,
      order: projects.length + 1,
      published: true,
    });
    setGallery([]);
  };

  const openEditor = async (p: Project) => {
    setEditing({ ...p });
    if (p.id !== 0) {
      setGalleryLoading(true);
      try {
        const res = await fetch(`/api/projects/${p.id}/images`);
        const imgs = await res.json();
        setGallery(Array.isArray(imgs) ? imgs : []);
      } catch {
        setGallery([]);
      } finally {
        setGalleryLoading(false);
      }
    } else {
      setGallery([]);
    }
  };

  const [imageUploading, setImageUploading] = useState(false);

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
      showToast(`✓ تم رفع الصورة بدقة كاملة (${formatFileSize(file.size)})`);
    } catch (err) {
      console.error("Image upload error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل رفع الصورة: ${msg}`);
    } finally {
      setImageUploading(false);
    }
  };

  // Gallery image upload — upload to Blob, then POST to /api/projects/[id]/images
  const handleGalleryUpload = async (file: File) => {
    if (!editing || editing.id === 0) {
      showToast("احفظي العمل أولاً قبل إضافة صور المعرض");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("الملف ليس صورة صالحة");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast("حجم الصورة كبير جداً (الحد الأقصى 25 ميجابايت)");
      return;
    }
    setGalleryUploading(true);
    try {
      showToast(`جاري رفع صورة المعرض (${formatFileSize(file.size)})...`);
      const formData = new FormData();
      formData.append("file", file);
      const upRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!upRes.ok) {
        const err = await upRes.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${upRes.status}`);
      }
      const upData = await upRes.json();

      const addRes = await fetch(`/api/projects/${editing.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: upData.url, caption: "" }),
      });
      if (!addRes.ok) {
        const err = await addRes.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${addRes.status}`);
      }
      const newImg = await addRes.json();
      setGallery([...gallery, newImg]);
      showToast("✓ تمت إضافة صورة المعرض");
    } catch (err) {
      console.error("Gallery upload error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل رفع صورة المعرض: ${msg}`);
    } finally {
      setGalleryUploading(false);
    }
  };

  const updateGalleryCaption = async (imageId: number, caption: string) => {
    setGallery(gallery.map((g) => (g.id === imageId ? { ...g, caption } : g)));
  };

  const saveGalleryCaption = async (imageId: number, caption: string) => {
    await fetch(`/api/projects/${editing?.id}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption }),
    });
  };

  const deleteGalleryImage = async (imageId: number) => {
    // legacy — replaced by ConfirmDialog + removeGalleryImage
    setGalleryDeleteTarget(gallery.find((g) => g.id === imageId) || null);
  };

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!editing) return;
    if (!editing.titleAr.trim()) {
      showToast("العنوان بالعربية مطلوب");
      return;
    }
    setSaving(true);
    try {
      const method = editing.id === 0 ? "POST" : "PUT";
      const url =
        editing.id === 0
          ? "/api/projects"
          : `/api/projects/${editing.id}`;
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
      if (editing.id === 0) {
        setProjects([...projects, saved]);
      } else {
        setProjects(
          projects.map((p) => (p.id === saved.id ? saved : p))
        );
      }
      setEditing(null);
      setGallery([]);
      showToast("تم الحفظ بنجاح ✓");
    } catch (err) {
      console.error("Save error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      if (msg.includes("413") || msg.includes("large") || msg.includes("big")) {
        showToast("الصورة كبيرة جداً حتى بعد الضغط. حاولي صورة أصغر.");
      } else if (msg.includes("401")) {
        showToast("انتهت الجلسة. سجّلي الدخول مجدداً.");
      } else {
        showToast(`خطأ في الحفظ: ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      setProjects(projects.filter((p) => p.id !== deleteTarget.id));
      showToast("تم حذف العمل وجميع صوره ✓");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("خطأ في الحذف");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Delete gallery image (with confirmation)
  const [galleryDeleteTarget, setGalleryDeleteTarget] = useState<{
    id: number;
    url: string;
    caption?: string;
  } | null>(null);

  const removeGalleryImage = async () => {
    if (!galleryDeleteTarget || !editing) return;
    try {
      const res = await fetch(
        `/api/projects/${editing.id}/images/${galleryDeleteTarget.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("فشل");
      setGallery(gallery.filter((g) => g.id !== galleryDeleteTarget.id));
      showToast("تم حذف الصورة من المعرض ✓");
    } catch {
      showToast("خطأ في حذف الصورة");
    } finally {
      setGalleryDeleteTarget(null);
    }
  };

  // Delete cover image (with confirmation + Blob cleanup)
  const [coverDeleteTarget, setCoverDeleteTarget] = useState<Project | null>(
    null
  );

  const removeCoverImage = async () => {
    if (!coverDeleteTarget || !editing) return;
    const oldUrl = editing.imageData;
    // Optimistically clear in UI
    setEditing({ ...editing, imageData: "" });
    try {
      // Save to DB
      const res = await fetch(`/api/projects/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, imageData: "" }),
      });
      if (!res.ok) throw new Error("فشل");
      // Delete from Blob if it was a Vercel Blob URL
      if (oldUrl && oldUrl.includes("vercel-storage.com")) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: oldUrl }),
        });
      }
      // Update list
      setProjects(
        projects.map((p) =>
          p.id === editing.id ? { ...p, imageData: "" } : p
        )
      );
      showToast("تم حذف صورة الغلاف ✓");
    } catch (err) {
      console.error("Cover delete error:", err);
      // Restore on failure
      setEditing({ ...editing, imageData: oldUrl });
      showToast("خطأ في حذف الصورة");
    } finally {
      setCoverDeleteTarget(null);
    }
  };

  // Filtered view (search + category filter)
  const filteredProjects = projects.filter((p) => {
    const matchesCategory =
      filterCategory === "all" || p.category === filterCategory;
    if (!matchesCategory) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.titleAr.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
            Portfolio Management
          </div>
          <h1 className="font-amiri text-4xl text-foreground mb-2">
            إدارة الأعمال
          </h1>
          <p className="text-muted-foreground">
            أضيفي وعدّلي أعمالك الفوتوغرافية. كل عمل يحتوي صورة، عنوان،
            وصف، وتفاصيل.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة عمل جديد
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
            placeholder="ابحثي بالعنوان (عربي/إنجليزي) أو الموقع..."
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

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="bg-card border border-border/60 rounded-sm overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-[oklch(0.2_0.02_285)] to-[oklch(0.1_0.005_285)] overflow-hidden">
              {p.imageData ? (
                <img
                  src={p.imageData}
                  alt={p.titleAr}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${p.palette1}, ${p.palette2})`,
                  }}
                />
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {p.featured && (
                  <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] rounded-full">
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
            </div>
            {/* Body */}
            <div className="p-4">
              <div className="font-amiri text-lg text-foreground mb-1">
                {p.titleAr || "بدون عنوان"}
              </div>
              <div className="font-display text-xs text-muted-foreground mb-3">
                {p.titleEn} · {p.year}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {categories.find((c) => c.id === p.category)?.labelAr} ·{" "}
                {p.location}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditor(p)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-sm hover:border-primary/40 hover:text-primary text-sm transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  تعديل
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="p-2 border border-border rounded-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          {projects.length === 0
            ? "لا توجد أعمال بعد. اضغطي \"إضافة عمل جديد\" للبدء."
            : "لا توجد نتائج مطابقة لبحثك."}
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-amiri text-3xl text-foreground">
                {editing.id === 0 ? "إضافة عمل جديد" : "تعديل العمل"}
              </h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setGallery([]);
                }}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Image upload */}
              <div className="bg-card border border-border/60 rounded-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase font-inter">
                    صورة العمل الرئيسية
                  </label>
                  {editing.imageData && (
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      صورة مرفوعة
                    </span>
                  )}
                </div>

                {editing.imageData ? (
                  <div className="space-y-3">
                    {/* Preview */}
                    <div className="relative group overflow-hidden rounded-md border border-border/60">
                      <img
                        src={editing.imageData}
                        alt="preview"
                        loading="lazy"
                        decoding="async"
                        className="w-full max-h-[400px] object-contain bg-background/40"
                      />
                      {/* Top right badge */}
                      <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] text-primary border border-primary/30">
                        الصورة الحالية
                      </div>
                    </div>

                    {/* Action buttons — always visible */}
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
                      <span className="text-[10px] text-muted-foreground/60 mr-auto">
                        💡 يمكنك أيضاً الضغط على "تبديل" لاستبدالها بصورة أخرى
                      </span>
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
                      اضغطي لرفع صورة العمل
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
                  💡 إذا لم تُرفع صورة، سيتم استخدام تدرج لوني تلقائي
                </p>
              </div>

              {/* Gallery images — only for existing projects */}
              {editing.id !== 0 && (
                <div className="bg-card border border-border/60 rounded-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase font-inter">
                      صور المعرض ({gallery.length})
                    </label>
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 border border-primary/40 text-primary rounded-sm hover:bg-primary/10 transition-colors text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      إضافة صورة للمعرض
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleGalleryUpload(f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {galleryUploading && (
                    <div className="flex items-center justify-center gap-3 py-6 border-2 border-dashed border-primary/40 rounded-sm bg-primary/5 mb-3">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-sm text-primary">
                        جاري رفع صورة المعرض...
                      </span>
                    </div>
                  )}

                  {galleryLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    </div>
                  ) : gallery.length === 0 && !galleryUploading ? (
                    <p className="text-sm text-muted-foreground/70 py-4 text-center">
                      لا توجد صور في المعرض. اضغطي "إضافة صورة للمعرض" لبدء الرفع.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {gallery.map((img) => (
                        <div
                          key={img.id}
                          className="space-y-1.5 group relative"
                        >
                          <div className="relative">
                            <img
                              src={img.url}
                              alt={img.caption || "gallery image"}
                              loading="lazy"
                              decoding="async"
                              className="w-full aspect-square object-cover rounded-sm border border-border"
                            />
                            <button
                              onClick={() => setGalleryDeleteTarget(img)}
                              className="absolute top-1 right-1 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) =>
                              updateGalleryCaption(img.id, e.target.value)
                            }
                            onBlur={(e) =>
                              saveGalleryCaption(img.id, e.target.value)
                            }
                            placeholder="تعليق..."
                            className="w-full px-2 py-1 text-xs bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editing.id === 0 && (
                <div className="bg-card border border-dashed border-border rounded-sm p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    💡 صور المعرض متاحة بعد حفظ العمل لأول مرة.
                  </p>
                </div>
              )}

              {/* Title & category */}
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
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      العنوان بالإنجليزية
                    </label>
                    <input
                      value={editing.titleEn}
                      onChange={(e) =>
                        setEditing({ ...editing, titleEn: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
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
                          {c.labelAr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      السنة
                    </label>
                    <input
                      value={editing.year}
                      onChange={(e) =>
                        setEditing({ ...editing, year: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الموقع
                    </label>
                    <input
                      value={editing.location}
                      onChange={(e) =>
                        setEditing({ ...editing, location: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    الوصف
                  </label>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              {/* Visual fallback */}
              {!editing.imageData && (
                <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الألوان الاحتياطية (عند عدم وجود صورة)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="color"
                          value={editing.palette1}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              palette1: e.target.value,
                            })
                          }
                          className="w-full h-10 rounded-sm cursor-pointer"
                        />
                        <div className="text-[10px] text-muted-foreground mt-1 text-center">
                          اللون 1
                        </div>
                      </div>
                      <div>
                        <input
                          type="color"
                          value={editing.palette2}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              palette2: e.target.value,
                            })
                          }
                          className="w-full h-10 rounded-sm cursor-pointer"
                        />
                        <div className="text-[10px] text-muted-foreground mt-1 text-center">
                          اللون 2
                        </div>
                      </div>
                      <div>
                        <input
                          type="color"
                          value={editing.palette3}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              palette3: e.target.value,
                            })
                          }
                          className="w-full h-10 rounded-sm cursor-pointer"
                        />
                        <div className="text-[10px] text-muted-foreground mt-1 text-center">
                          اللون 3
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                        الشكل (Motif)
                      </label>
                      <select
                        value={editing.motif}
                        onChange={(e) =>
                          setEditing({ ...editing, motif: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                      >
                        {motifs.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                        الحجم
                      </label>
                      <select
                        value={editing.span}
                        onChange={(e) =>
                          setEditing({ ...editing, span: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                      >
                        {spans.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.labelAr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div className="bg-card border border-border/60 rounded-sm p-5 grid sm:grid-cols-3 gap-3">
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
                  {editing.published ? "منشور" : "مخفي"}
                </button>
                <div className="flex items-center gap-2">
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
                  onClick={() => {
                    setEditing(null);
                    setGallery([]);
                  }}
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
                  {saving ? "جاري الحفظ..." : "حفظ العمل"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete project confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف العمل"
        message={
          deleteTarget
            ? `هل أنت متأكدة من حذف "${deleteTarget.titleAr}"؟ سيتم حذف صورة الغلاف وجميع صور المعرض نهائياً.`
            : ""
        }
        confirmText="نعم، احذفي"
        cancelText="إلغاء"
        danger
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Delete gallery image confirmation */}
      <ConfirmDialog
        open={!!galleryDeleteTarget}
        title="حذف الصورة من المعرض"
        message="هل أنت متأكدة من حذف هذه الصورة من المعرض؟ لا يمكن التراجع."
        confirmText="حذف الصورة"
        cancelText="إبقاء"
        danger
        onConfirm={removeGalleryImage}
        onCancel={() => setGalleryDeleteTarget(null)}
      />

      {/* Delete cover image confirmation */}
      <ConfirmDialog
        open={!!coverDeleteTarget}
        title="حذف صورة الغلاف"
        message="هل أنت متأكدة من حذف صورة الغلاف؟ سيتم استخدام تدرج لوني تلقائي بدلاً منها، ويمكنك رفع صورة جديدة في أي وقت."
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
