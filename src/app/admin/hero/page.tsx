"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Field,
  TextAreaField,
  SaveButton,
  SectionCard,
  Toast,
} from "@/components/admin/Fields";

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
};

export default function HeroAdminPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setS(data))
      .finally(() => setLoading(false));
  }, []);

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
      setToast("تم حفظ التغييرات بنجاح ✓");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("خطأ في الحفظ");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const update = (k: keyof Settings, v: string) =>
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));

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
          الأزرار، والإحصائيات.
        </p>
      </motion.div>

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

      <Toast message={toast} />
    </div>
  );
}
