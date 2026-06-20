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
  contactTitleAr: string;
  contactSubtitleEn: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactInstagram: string;
  contactWhatsapp: string;
  footerDesc: string;
  footerCopyright: string;
};

const emptySettings: Settings = {
  contactTitleAr: "",
  contactSubtitleEn: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  contactInstagram: "",
  contactWhatsapp: "",
  footerDesc: "",
  footerCopyright: "",
};

export default function ContactAdminPage() {
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
          Contact & Footer
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          التواصل والفوتر
        </h1>
        <p className="text-muted-foreground">
          عدّلي معلومات التواصل والنص الذي يظهر في أسفل الموقع.
        </p>
      </motion.div>

      <SectionCard
        title="معلومات التواصل"
        description="العنوان، البريد، الهاتف، العنوان الفيزيائي، وروابط التواصل"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="العنوان (عربي)"
            value={s.contactTitleAr}
            onChange={(v) => update("contactTitleAr", v)}
            hint="عنوان قسم التواصل في الموقع"
          />
          <Field
            label="العنوان الفرعي (إنجليزي)"
            value={s.contactSubtitleEn}
            onChange={(v) => update("contactSubtitleEn", v)}
          />
        </div>
        <Field
          label="البريد الإلكتروني"
          value={s.contactEmail}
          onChange={(v) => update("contactEmail", v)}
          type="email"
          placeholder="maryam@example.com"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="رقم الهاتف"
            value={s.contactPhone}
            onChange={(v) => update("contactPhone", v)}
            placeholder="+966 5X XXX XXXX"
          />
          <Field
            label="العنوان الفيزيائي"
            value={s.contactAddress}
            onChange={(v) => update("contactAddress", v)}
            placeholder="الرياض، المملكة العربية السعودية"
          />
        </div>
        <Field
          label="رابط الإنستغرام"
          value={s.contactInstagram}
          onChange={(v) => update("contactInstagram", v)}
          placeholder="https://instagram.com/..."
        />
        <Field
          label="رابط واتساب"
          value={s.contactWhatsapp}
          onChange={(v) => update("contactWhatsapp", v)}
          placeholder="https://wa.me/9665XXXXXXXX"
        />
      </SectionCard>

      <SectionCard
        title="الفوتر"
        description="النص الذي يظهر في أسفل كل الصفحات"
      >
        <TextAreaField
          label="وصف الفوتر"
          value={s.footerDesc}
          onChange={(v) => update("footerDesc", v)}
          rows={3}
          hint="فقرة قصيرة تظهر في عمود الفوتر"
        />
        <Field
          label="نص حقوق النشر"
          value={s.footerCopyright}
          onChange={(v) => update("footerCopyright", v)}
          placeholder="© 2025 Maryam Photography. جميع الحقوق محفوظة."
        />
      </SectionCard>

      <div className="flex justify-end gap-3 pt-2">
        <SaveButton onSave={save} loading={saving} />
      </div>

      <Toast message={toast} />
    </div>
  );
}
