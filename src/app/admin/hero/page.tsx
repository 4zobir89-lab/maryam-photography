"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, Trash2 } from "lucide-react";
import {
  Field,
  TextAreaField,
  SaveButton,
  SectionCard,
  Toast,
} from "@/components/admin/Fields";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatFileSize } from "@/lib/imageCompress";

type Settings = {
  siteNameAr: string;
  siteNameEn: string;
  logoLetter: string;
  taglineAr: string;
  taglineEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroDescAr: string;
  heroCta1Ar: string;
  heroCta2Ar: string;
  heroStat1Num: string;
  heroStat1Label: string;
  heroStat2Num: string;
  heroStat2Label: string;
  heroStat3Num: string;
  heroStat3Label: string;
  marqueeWords: string;
  heroImageData: string;
};

export default function HeroAdminPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDeleteOpen, setImageDeleteOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) =>
        setS({
          siteNameAr: data.siteNameAr ?? "",
          siteNameEn: data.siteNameEn ?? "",
          logoLetter: data.logoLetter ?? "",
          taglineAr: data.taglineAr ?? "",
          taglineEn: data.taglineEn ?? "",
          heroTitleAr: data.heroTitleAr ?? "",
          heroSubtitleEn: data.heroSubtitleEn ?? "",
          heroDescAr: data.heroDescAr ?? "",
          heroCta1Ar: data.heroCta1Ar ?? "",
          heroCta2Ar: data.heroCta2Ar ?? "",
          heroStat1Num: data.heroStat1Num ?? "",
          heroStat1Label: data.heroStat1Label ?? "",
          heroStat2Num: data.heroStat2Num ?? "",
          heroStat2Label: data.heroStat2Label ?? "",
          heroStat3Num: data.heroStat3Num ?? "",
          heroStat3Label: data.heroStat3Label ?? "",
          marqueeWords: data.marqueeWords ?? "",
          heroImageData: data.heroImageData ?? "",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      showToast("تم حفظ التغييرات بنجاح ✓");
    } catch {
      showToast("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const update = (k: keyof Settings, v: string) =>
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));

  // ===== Hero image upload =====
  const handleImageUpload = async (file: File) => {
    if (!s) return;
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
      setS({ ...s, heroImageData: data.url });
      // Persist immediately so the public site reflects the change
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImageData: data.url }),
      });
      showToast(`✓ تم رفع الصورة وحفظها (${formatFileSize(file.size)})`);
    } catch (err) {
      console.error("Hero image upload error:", err);
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`فشل رفع الصورة: ${msg}`);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = async () => {
    if (!s) return;
    const oldUrl = s.heroImageData;
    setS({ ...s, heroImageData: "" });
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImageData: "" }),
      });
      if (oldUrl && oldUrl.includes("vercel-storage.com")) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: oldUrl }),
        }).catch(() => {});
      }
      showToast("تم حذف صورة الـ Hero ✓");
    } catch (err) {
      console.error("Hero image delete error:", err);
      setS({ ...s, heroImageData: oldUrl });
      showToast("خطأ في حذف الصورة");
    } finally {
      setImageDeleteOpen(false);
    }
  };

  if (loading || !s) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
          Hero Section
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          القسم الرئيسي
        </h1>
        <p className="text-muted-foreground">
          عدّلي النصوص الرئيسية في أعلى الصفحة الأولى — الاسم، الوصف،
          الأزرار، الإحصائيات، والصورة الخلفية.
        </p>
      </motion.div>

      {/* Hero background image upload */}
      <SectionCard
        title="صورة الخلفية"
        description="صورة الـ Hero التي تظهر خلف العنوان الرئيسي في أعلى الصفحة"
      >
        {s.heroImageData ? (
          <div className="space-y-3">
            <div className="relative group overflow-hidden rounded-md border border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.heroImageData}
                alt="Hero background"
                loading="lazy"
                decoding="async"
                className="w-full max-h-[360px] object-cover bg-background/40"
              />
              <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] text-primary border border-primary/30">
                الصورة الحالية
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
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
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <button
                onClick={() => setImageDeleteOpen(true)}
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
              اضغطي لرفع صورة الـ Hero
            </span>
            <span className="text-xs text-muted-foreground/70 mb-2">
              PNG, JPG, WebP — حد أقصى 25 ميجابايت
            </span>
            <span className="text-[10px] text-primary/60">
              ✦ يُفضّل صورة عمودية أو واسعة بدقة عالية
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
        <p className="text-xs text-muted-foreground/70 mt-3">
          💡 إذا لم تُرفع صورة، سيتم استخدام تدرج لوني افتراضي كخلفية.
        </p>
      </SectionCard>

      <SectionCard
        title="هوية الموقع"
        description="الاسم الذي يظهر في الشعار والـ Navbar"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="الاسم بالعربية"
            value={s.siteNameAr}
            onChange={(v) => update("siteNameAr", v)}
          />
          <Field
            label="الاسم بالإنجليزية"
            value={s.siteNameEn}
            onChange={(v) => update("siteNameEn", v)}
          />
          <Field
            label="حرف الشعار"
            value={s.logoLetter}
            onChange={(v) => update("logoLetter", v)}
            hint="حرف واحد يظهر داخل دائرة الشعار (مثال: M)"
          />
          <Field
            label="الوصف المختصر (Tagline)"
            value={s.taglineAr}
            onChange={(v) => update("taglineAr", v)}
          />
        </div>
        <Field
          label="الوصف بالإنجليزية (Tagline EN)"
          value={s.taglineEn}
          onChange={(v) => update("taglineEn", v)}
        />
      </SectionCard>

      <SectionCard
        title="محتوى الـ Hero"
        description="العنوان الكبير والوصف في أعلى الصفحة"
      >
        <Field
          label="العنوان الرئيسي (العربية)"
          value={s.heroTitleAr}
          onChange={(v) => update("heroTitleAr", v)}
          hint="هذا هو العنوان الضخم الذي يظهر في وسط الصفحة الأولى"
        />
        <Field
          label="العنوان الفرعي (الإنجليزية)"
          value={s.heroSubtitleEn}
          onChange={(v) => update("heroSubtitleEn", v)}
          hint="يظهر تحت الاسم بخط إنجليزي"
        />
        <TextAreaField
          label="الوصف"
          value={s.heroDescAr}
          onChange={(v) => update("heroDescAr", v)}
          rows={3}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="زر رئيسي"
            value={s.heroCta1Ar}
            onChange={(v) => update("heroCta1Ar", v)}
          />
          <Field
            label="زر ثانوي"
            value={s.heroCta2Ar}
            onChange={(v) => update("heroCta2Ar", v)}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="الإحصائيات"
        description="الأرقام الثلاثة تحت الـ Hero"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-3">
            <Field
              label="الرقم 1"
              value={s.heroStat1Num}
              onChange={(v) => update("heroStat1Num", v)}
            />
            <Field
              label="الوصف 1"
              value={s.heroStat1Label}
              onChange={(v) => update("heroStat1Label", v)}
            />
          </div>
          <div className="space-y-3">
            <Field
              label="الرقم 2"
              value={s.heroStat2Num}
              onChange={(v) => update("heroStat2Num", v)}
            />
            <Field
              label="الوصف 2"
              value={s.heroStat2Label}
              onChange={(v) => update("heroStat2Label", v)}
            />
          </div>
          <div className="space-y-3">
            <Field
              label="الرقم 3"
              value={s.heroStat3Num}
              onChange={(v) => update("heroStat3Num", v)}
            />
            <Field
              label="الوصف 3"
              value={s.heroStat3Label}
              onChange={(v) => update("heroStat3Label", v)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="الشريط المتحرك"
        description="الكلمات التي تتحرك في الشريط الذهبي"
      >
        <Field
          label="الكلمات (مفصولة بفاصلة)"
          value={s.marqueeWords}
          onChange={(v) => update("marqueeWords", v)}
          hint="مثال: بورتريه,Portraits,أعراس,Weddings"
        />
      </SectionCard>

      <div className="flex justify-end gap-3 pt-2">
        <SaveButton onSave={save} loading={saving} />
      </div>

      <ConfirmDialog
        open={imageDeleteOpen}
        title="حذف صورة الـ Hero"
        message="هل أنت متأكدة من حذف صورة الخلفية؟ سيتم استخدام تدرج لوني افتراضي بدلاً منها، ويمكنك رفع صورة جديدة في أي وقت."
        confirmText="نعم، احذفي الصورة"
        cancelText="إبقاء الصورة"
        danger
        onConfirm={removeImage}
        onCancel={() => setImageDeleteOpen(false)}
      />

      <Toast message={toast} />
    </div>
  );
}
