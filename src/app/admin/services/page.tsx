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
  Heart,
  Camera,
  Building2,
  Sparkles,
} from "lucide-react";
import { Toast } from "@/components/admin/Fields";

type Service = {
  id: number;
  titleAr: string;
  titleEn: string;
  description: string;
  price: string;
  duration: string;
  features: string; // JSON array as string
  icon: string; // Heart | Camera | Building2 | Sparkles
  accentFrom: string;
  featured: boolean;
  order: number;
  published: boolean;
};

// Editor state: same as Service but features is a plain string of newline-separated lines
type EditorState = Omit<Service, "features"> & { features: string };

const iconOptions = [
  { id: "Heart", Icon: Heart },
  { id: "Camera", Icon: Camera },
  { id: "Building2", Icon: Building2 },
  { id: "Sparkles", Icon: Sparkles },
];

function IconForName({ name, className }: { name: string; className?: string }) {
  const found = iconOptions.find((o) => o.id === name);
  if (!found) return <Camera className={className} />;
  const { Icon } = found;
  return <Icon className={className} />;
}

// Convert service.features (JSON string) to newline-separated text
function featuresToText(featuresJson: string): string {
  try {
    const arr = JSON.parse(featuresJson);
    if (Array.isArray(arr)) return arr.join("\n");
    return "";
  } catch {
    return "";
  }
}

function textToFeaturesJson(text: string): string {
  const arr = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return JSON.stringify(arr);
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditorState | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/services?all=1")
      .then((r) => r.json())
      .then(setServices)
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
      description: "",
      price: "",
      duration: "",
      features: "",
      icon: "Camera",
      accentFrom: "oklch(0.78 0.13 75 / 0.15)",
      featured: false,
      order: services.length + 1,
      published: true,
    });
  };

  const editExisting = (s: Service) => {
    setEditing({ ...s, features: featuresToText(s.features) });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.titleAr.trim()) {
      showToast("العنوان بالعربية مطلوب");
      return;
    }
    setSaving(true);
    try {
      // Convert features text -> JSON string
      const payload: Service = {
        ...editing,
        features: textToFeaturesJson(editing.features),
      };
      const method = editing.id === 0 ? "POST" : "PUT";
      const url =
        editing.id === 0 ? "/api/services" : `/api/services/${editing.id}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("فشل");
      const saved: Service = await res.json();
      if (editing.id === 0) {
        setServices([...services, saved]);
      } else {
        setServices(services.map((s) => (s.id === saved.id ? saved : s)));
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
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل");
      setServices(services.filter((s) => s.id !== id));
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
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
            Services Management
          </div>
          <h1 className="font-amiri text-4xl text-foreground mb-2">
            إدارة الخدمات
          </h1>
          <p className="text-muted-foreground">
            أضيفي وعدّلي الخدمات الفوتوغرافية — العناوين، الأسعار، المدة،
            والمميزات.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة خدمة
        </button>
      </motion.div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => {
          const features: string[] = (() => {
            try {
              const arr = JSON.parse(s.features);
              return Array.isArray(arr) ? arr : [];
            } catch {
              return [];
            }
          })();
          return (
            <div
              key={s.id}
              className="bg-card border border-border/60 rounded-sm overflow-hidden group flex flex-col"
            >
              {/* Header strip with icon */}
              <div
                className="relative p-5 border-b border-border/40"
                style={{
                  background: `linear-gradient(135deg, ${s.accentFrom}, transparent)`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-sm bg-background/60 backdrop-blur flex items-center justify-center border border-border/40">
                    <IconForName
                      name={s.icon}
                      className="w-5 h-5 text-primary"
                    />
                  </div>
                  <div className="flex gap-1">
                    {s.featured && (
                      <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] rounded-full">
                        مميز
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full ${
                        s.published
                          ? "bg-green-600/80 text-white"
                          : "bg-gray-600/80 text-white"
                      }`}
                    >
                      {s.published ? "منشور" : "مخفي"}
                    </span>
                  </div>
                </div>
                <div className="font-amiri text-xl text-foreground mt-3">
                  {s.titleAr || "بدون عنوان"}
                </div>
                {s.titleEn && (
                  <div className="font-display text-xs text-muted-foreground mt-1">
                    {s.titleEn}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col">
                {s.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {s.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-inter mb-0.5">
                      السعر
                    </div>
                    <div className="text-foreground">{s.price || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-inter mb-0.5">
                      المدة
                    </div>
                    <div className="text-foreground">{s.duration || "—"}</div>
                  </div>
                </div>
                {features.length > 0 && (
                  <div className="text-xs text-muted-foreground mb-3">
                    {features.length} ميزة
                  </div>
                )}
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => editExisting(s)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-sm hover:border-primary/40 hover:text-primary text-sm transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    تعديل
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="p-2 border border-border rounded-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          لا توجد خدمات بعد. اضغطي "إضافة خدمة" للبدء.
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-amiri text-3xl text-foreground">
                {editing.id === 0 ? "إضافة خدمة جديدة" : "تعديل الخدمة"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Titles */}
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

              {/* Price & duration */}
              <div className="bg-card border border-border/60 rounded-sm p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      السعر
                    </label>
                    <input
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({ ...editing, price: e.target.value })
                      }
                      placeholder="مثال: يبدأ من 1,200$"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      المدة
                    </label>
                    <input
                      value={editing.duration}
                      onChange={(e) =>
                        setEditing({ ...editing, duration: e.target.value })
                      }
                      placeholder="مثال: 8 ساعات"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Features editor */}
              <div className="bg-card border border-border/60 rounded-sm p-5">
                <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                  المميزات (كل سطر = ميزة)
                </label>
                <textarea
                  value={editing.features}
                  onChange={(e) =>
                    setEditing({ ...editing, features: e.target.value })
                  }
                  rows={5}
                  placeholder={"مثال:\nالباقة الأساسية\nتعديل احترافي\nتسليم خلال 7 أيام"}
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground/70 mt-2">
                  اكتبي كل ميزة في سطر منفصل. سيتم تخزينها تلقائياً كمصفوفة.
                </p>
              </div>

              {/* Icon & accent color */}
              <div className="bg-card border border-border/60 rounded-sm p-5 space-y-4">
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-3 font-inter">
                    الأيقونة
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map(({ id, Icon }) => (
                      <button
                        key={id}
                        onClick={() =>
                          setEditing({ ...editing, icon: id })
                        }
                        className={`flex flex-col items-center justify-center gap-1.5 py-4 border rounded-sm transition-all ${
                          editing.icon === id
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-inter">{id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    اللون المميز (oklch)
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-sm border border-border shrink-0"
                      style={{ background: editing.accentFrom }}
                    />
                    <input
                      value={editing.accentFrom}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          accentFrom: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles + order */}
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
                  حفظ الخدمة
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
