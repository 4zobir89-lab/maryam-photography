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
} from "lucide-react";
import { Toast } from "@/components/admin/Fields";

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
  };

  const handleImageUpload = async (file: File) => {
    if (!editing) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditing({ ...editing, imageData: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titleAr.trim()) {
      showToast("العنوان بالعربية مطلوب");
      return;
    }
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
      if (!res.ok) throw new Error("فشل");
      const saved = await res.json();
      if (editing.id === 0) {
        setProjects([...projects, saved]);
      } else {
        setProjects(
          projects.map((p) => (p.id === saved.id ? saved : p))
        );
      }
      setEditing(null);
      showToast("تم الحفظ بنجاح ✓");
    } catch {
      showToast("خطأ في الحفظ");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العمل؟")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects(projects.filter((p) => p.id !== id));
    showToast("تم الحذف");
  };

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

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
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
                  onClick={() => setEditing({ ...p })}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-sm hover:border-primary/40 hover:text-primary text-sm transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  تعديل
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="p-2 border border-border rounded-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          لا توجد أعمال بعد. اضغطي "إضافة عمل جديد" للبدء.
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
                onClick={() => setEditing(null)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Image upload */}
              <div className="bg-card border border-border/60 rounded-sm p-5">
                <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-3 font-inter">
                  صورة العمل
                </label>
                {editing.imageData ? (
                  <div className="relative group">
                    <img
                      src={editing.imageData}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-sm"
                    />
                    <button
                      onClick={() =>
                        setEditing({ ...editing, imageData: "" })
                      }
                      className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-sm p-10 cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <span className="text-sm text-muted-foreground mb-1">
                      اضغطي لرفع صورة
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      PNG, JPG, WebP — حد أقصى 2 ميجابايت
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
                  onClick={() => setEditing(null)}
                  className="px-5 py-2.5 border border-border text-muted-foreground rounded-sm hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  onClick={save}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90"
                >
                  <Save className="w-4 h-4" />
                  حفظ العمل
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
