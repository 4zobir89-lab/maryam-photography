"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import {
  Field,
  TextAreaField,
  SaveButton,
  SectionCard,
  Toast,
} from "@/components/admin/Fields";

type PhilosophyCard = {
  id: number;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  order: number;
};

type Settings = {
  aboutTitleAr: string;
  aboutSubtitleEn: string;
  aboutHeadingAr: string;
  aboutPara1: string;
  aboutPara2: string;
  aboutTags: string;
  aboutSignature: string;
};

const iconOptions = ["Camera", "Globe2", "Award", "Heart", "Sparkles", "Star"];

export default function AboutAdminPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [cards, setCards] = useState<PhilosophyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCards, setSavingCards] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/philosophy").then((r) => r.json()),
    ])
      .then(([settings, phil]) => {
        setS(settings);
        setCards(phil);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      setToast("تم حفظ التغييرات ✓");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const update = (k: keyof Settings, v: string) =>
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));

  const updateCard = (id: number, k: keyof PhilosophyCard, v: string | number) =>
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [k]: v } : c))
    );

  const addCard = async () => {
    const res = await fetch("/api/philosophy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        icon: "Camera",
        titleAr: "عنوان جديد",
        titleEn: "New Card",
        descAr: "وصف البطاقة",
      }),
    });
    if (res.ok) {
      const newCard = await res.json();
      setCards([...cards, newCard]);
    }
  };

  const deleteCard = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه البطاقة؟")) return;
    await fetch(`/api/philosophy/${id}`, { method: "DELETE" });
    setCards(cards.filter((c) => c.id !== id));
  };

  const saveCards = async () => {
    setSavingCards(true);
    try {
      await Promise.all(
        cards.map((c) =>
          fetch(`/api/philosophy/${c.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(c),
          })
        )
      );
      setToast("تم حفظ البطاقات ✓");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSavingCards(false);
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
          About Section
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          قسم "عن مريم"
        </h1>
        <p className="text-muted-foreground">
          عدّلي السيرة الذاتية، الفقرات، الوسوم، والبطاقات الأربع.
        </p>
      </motion.div>

      <SectionCard title="عناوين القسم">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="العنوان الرئيسي (عربي)"
            value={s.aboutTitleAr}
            onChange={(v) => update("aboutTitleAr", v)}
          />
          <Field
            label="العنوان الفرعي (إنجليزي)"
            value={s.aboutSubtitleEn}
            onChange={(v) => update("aboutSubtitleEn", v)}
          />
        </div>
        <Field
          label="العنوان الكبير"
          value={s.aboutHeadingAr}
          onChange={(v) => update("aboutHeadingAr", v)}
        />
      </SectionCard>

      <SectionCard title="النصوص">
        <TextAreaField
          label="الفقرة الأولى"
          value={s.aboutPara1}
          onChange={(v) => update("aboutPara1", v)}
          rows={4}
        />
        <TextAreaField
          label="الفقرة الثانية"
          value={s.aboutPara2}
          onChange={(v) => update("aboutPara2", v)}
          rows={4}
        />
        <Field
          label="الوسوم (مفصولة بفاصلة)"
          value={s.aboutTags}
          onChange={(v) => update("aboutTags", v)}
          hint="مثال: بورتريه, تصوير أعراس, فوتوجورناليزم"
        />
        <Field
          label="التوقيع"
          value={s.aboutSignature}
          onChange={(v) => update("aboutSignature", v)}
        />
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton onSave={save} loading={saving} />
      </div>

      {/* Philosophy Cards */}
      <SectionCard
        title="بطاقات الفلسفة (4 بطاقات)"
        description="البطاقات التي تظهر تحت السيرة الذاتية"
      >
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="p-4 bg-background/40 border border-border/40 rounded-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  بطاقة #{card.id}
                </span>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="text-red-400 hover:bg-red-500/10 p-2 rounded-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  label="العنوان (عربي)"
                  value={card.titleAr}
                  onChange={(v) => updateCard(card.id, "titleAr", v)}
                />
                <Field
                  label="العنوان (إنجليزي)"
                  value={card.titleEn}
                  onChange={(v) => updateCard(card.id, "titleEn", v)}
                />
              </div>
              <TextAreaField
                label="الوصف"
                value={card.descAr}
                onChange={(v) => updateCard(card.id, "descAr", v)}
                rows={2}
              />
              <div className="space-y-2">
                <label className="text-xs tracking-widest text-muted-foreground uppercase font-inter">
                  الأيقونة
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => updateCard(card.id, "icon", icon)}
                      className={`px-3 py-1.5 text-xs border rounded-full transition-all ${
                        card.icon === icon
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={addCard}
            className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-primary rounded-sm hover:bg-primary/10 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة بطاقة
          </button>
          <button
            onClick={saveCards}
            disabled={savingCards}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {savingCards ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ البطاقات
          </button>
        </div>
      </SectionCard>

      <Toast message={toast} />
    </div>
  );
}
