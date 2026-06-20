"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Field,
  SaveButton,
  SectionCard,
  Toast,
} from "@/components/admin/Fields";

type Settings = {
  portfolioTitleAr: string;
  portfolioSubtitleEn: string;
  servicesTitleAr: string;
  servicesSubtitleEn: string;
  testimonialsTitleAr: string;
  testimonialsSubtitleEn: string;
  primaryColor: string;
  backgroundColor: string;
};

const emptySettings: Settings = {
  portfolioTitleAr: "",
  portfolioSubtitleEn: "",
  servicesTitleAr: "",
  servicesSubtitleEn: "",
  testimonialsTitleAr: "",
  testimonialsSubtitleEn: "",
  primaryColor: "oklch(0.78 0.13 75)",
  backgroundColor: "oklch(0.15 0.01 285)",
};

export default function SettingsAdminPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setS({ ...emptySettings, ...data }))
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
          Site Settings
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          إعدادات الموقع
        </h1>
        <p className="text-muted-foreground">
          عدّلي عناوين الأقسام الرئيسية وألوان الموقع العامة.
        </p>
      </motion.div>

      <SectionCard
        title="عناوين الأقسام"
        description="العناوين التي تظهر في رأس كل قسم من أقسام الموقع"
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="عنوان قسم الأعمال (عربي)"
              value={s.portfolioTitleAr}
              onChange={(v) => update("portfolioTitleAr", v)}
            />
            <Field
              label="عنوان فرعي للأعمال (إنجليزي)"
              value={s.portfolioSubtitleEn}
              onChange={(v) => update("portfolioSubtitleEn", v)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="عنوان قسم الخدمات (عربي)"
              value={s.servicesTitleAr}
              onChange={(v) => update("servicesTitleAr", v)}
            />
            <Field
              label="عنوان فرعي للخدمات (إنجليزي)"
              value={s.servicesSubtitleEn}
              onChange={(v) => update("servicesSubtitleEn", v)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="عنوان قسم آراء العملاء (عربي)"
              value={s.testimonialsTitleAr}
              onChange={(v) => update("testimonialsTitleAr", v)}
            />
            <Field
              label="عنوان فرعي للآراء (إنجليزي)"
              value={s.testimonialsSubtitleEn}
              onChange={(v) => update("testimonialsSubtitleEn", v)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="الألوان"
        description="ألوان الموقع الأساسية بصيغة oklch. الصقي القيمة كاملة."
      >
        <div className="space-y-5">
          <ColorField
            label="اللون الأساسي (Primary)"
            value={s.primaryColor}
            onChange={(v) => update("primaryColor", v)}
            hint="اللون الذهبي الأساسي للأزرار والروابط"
          />
          <ColorField
            label="لون الخلفية (Background)"
            value={s.backgroundColor}
            onChange={(v) => update("backgroundColor", v)}
            hint="لون خلفية الموقع"
          />
        </div>
      </SectionCard>

      <div className="flex justify-end gap-3 pt-2">
        <SaveButton onSave={save} loading={saving} />
      </div>

      <Toast message={toast} />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs tracking-widest text-muted-foreground uppercase font-inter block">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-sm border border-border shrink-0"
          style={{ background: value }}
          aria-hidden
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="oklch(0.78 0.13 75)"
          className="flex-1 px-3 py-2 bg-background/50 border border-border rounded-sm focus:outline-none focus:border-primary font-mono text-sm"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
