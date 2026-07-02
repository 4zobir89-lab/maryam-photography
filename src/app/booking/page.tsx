"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Send,
  Check,
  Loader2,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Camera,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { CursorGlow } from "@/components/shared/CursorGlow";

type Settings = {
  contactWhatsapp?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
};

const serviceOptions = [
  { id: "wedding", labelAr: "تصوير أعراس", labelEn: "Wedding" },
  { id: "portrait", labelAr: "بورتريه فردي", labelEn: "Portrait" },
  { id: "commercial", labelAr: "تصوير تجاري", labelEn: "Commercial" },
  { id: "workshop", labelAr: "ورش عمل", labelEn: "Workshop" },
  { id: "other", labelAr: "أخرى", labelEn: "Other" },
];

function serviceLabelAr(id: string): string {
  return serviceOptions.find((s) => s.id === id)?.labelAr ?? id;
}

type FormState = {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string;
  location: string;
  message: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  service: "wedding",
  preferredDate: "",
  location: "",
  message: "",
};

export default function BookingPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedBooking, setSavedBooking] = useState<{
    id: number;
    service: string;
    preferredDate: string | null;
    name: string;
  } | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => {});
  }, []);

  const set = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): string | null => {
    if (!form.name.trim()) return "الاسم مطلوب";
    if (!form.phone.trim()) return "رقم الهاتف مطلوب";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "البريد الإلكتروني غير صالح";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus("error");
      setErrorMsg(err);
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "فشل إرسال الطلب. حاول مرة أخرى.");
        return;
      }
      setSavedBooking({
        id: data.id,
        service: data.service || form.service,
        preferredDate: data.preferredDate || (form.preferredDate ? new Date(form.preferredDate).toISOString() : null),
        name: form.name,
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
    }
  };

  const buildWhatsAppUrl = (): string => {
    const waNumber = (settings?.contactWhatsapp || "").replace(/[^+\d]/g, "");
    const serviceAr = serviceLabelAr(savedBooking?.service || form.service);
    const dateStr = savedBooking?.preferredDate
      ? new Date(savedBooking.preferredDate).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : form.preferredDate
        ? new Date(form.preferredDate).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "تاريخ لم يُحدد بعد";
    const name = savedBooking?.name || form.name;
    const text = encodeURIComponent(
      `السلام عليكم مريم، أحجزت جلسة ${serviceAr} بتاريخ ${dateStr}. اسمي: ${name}`
    );
    return waNumber
      ? `https://wa.me/${waNumber}?text=${text}`
      : `https://wa.me/?text=${text}`;
  };

  const reset = () => {
    setForm(emptyForm);
    setSavedBooking(null);
    setStatus("idle");
    setErrorMsg("");
  };

  const tips = [
    {
      icon: Camera,
      titleAr: "قبل الجلسة",
      textAr: "جهّز أزياء احتياطية وحدّد الأماكن التي ترغب بالتصوير فيها مسبقًا.",
    },
    {
      icon: Sparkles,
      titleAr: "أثناء التصوير",
      textAr: "لا تقلق من الوضعيات — مريم ستوجّهك بكل هدوء وراحة.",
    },
    {
      icon: Clock,
      titleAr: "بعد الجلسة",
      textAr: "ستصلك الصور المختارة خلال 7-14 يومًا للمراجعة قبل التسليم النهائي.",
    },
  ];

  return (
    <main className="relative min-h-screen flex flex-col bg-background">
      <CursorGlow />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[oklch(0.55_0.1_40_/_0.05)] rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center">
          <div className="font-inter text-[10px] tracking-[0.5em] text-primary uppercase mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-primary/40" />
            Book a Session
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h1 className="font-amiri text-5xl md:text-7xl text-foreground mb-4 leading-tight">
            <span className="text-gold-gradient">احجز</span> جلسة تصوير
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            املأ النموذج التالي وسأتواصل معك خلال 24 ساعة لتأكيد الموعد والتفاصيل.
            كل حكاية تستحق أن تُروى بإطار لا يُنسى.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="container mx-auto max-w-7xl px-6 pb-24 flex-1">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            {status === "success" ? (
              <div className="glass-card rounded-sm p-10 text-center min-h-[500px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center mb-6">
                  <Check className="w-9 h-9 text-green-400" />
                </div>
                <h2 className="font-amiri text-4xl text-foreground mb-3">
                  تم استلام طلبك
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
                  شكرًا لك يا {savedBooking?.name}. وصلنا طلبك لحجز جلسة{" "}
                  <span className="text-primary font-medium">
                    {serviceLabelAr(savedBooking?.service || form.service)}
                  </span>
                  . سأعود إليك خلال 24 ساعة لتأكيد الموعد. لإرسال تذكير سريع عبر
                  WhatsApp:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 text-white rounded-full font-medium tracking-wide transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    إرسال تذكير عبر WhatsApp
                  </a>
                  <button
                    onClick={reset}
                    className="px-6 py-4 border border-border text-foreground hover:border-primary/40 hover:text-primary rounded-full font-medium tracking-wide transition-colors"
                  >
                    حجز جديد
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass-card rounded-sm p-8 md:p-10 space-y-6"
              >
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-sm">
                  <CalendarCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    عند الإرسال سيتم حفظ طلبك في لوحة التحكم. بعدها يمكنك إرسال
                    تذكير سريع عبر <strong className="text-primary">WhatsApp</strong> لإسراع الرد.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      الاسم الكامل *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="مثال: أحمد علي"
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      رقم الهاتف *
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+967 77 123 4567"
                      dir="ltr"
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    dir="ltr"
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-right"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      نوع الخدمة
                    </label>
                    <select
                      value={form.service}
                      onChange={(e) => set("service", e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    >
                      {serviceOptions.map((s) => (
                        <option key={s.id} value={s.id} className="bg-card">
                          {s.labelAr} — {s.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                      التاريخ المفضل (اختياري)
                    </label>
                    <input
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => set("preferredDate", e.target.value)}
                      dir="ltr"
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground focus:outline-none focus:border-primary transition-colors text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    الموقع (اختياري)
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="مثال: صنعاء، استوديو مريم..."
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                    تفاصيل إضافية (اختياري)
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder="أخبريني عن مناسبتك، عدد الأشخاص، ألوان الأزياء، أو أي تفاصيل تودين مشاركتها..."
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {status === "error" && errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-red-300 text-sm">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group w-full py-4 rounded-full font-medium tracking-wide transition-all duration-500 flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال طلب الحجز
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  بياناتك تُحفظ بسرّية ولن تُشارك مع أي طرف ثالث.
                </p>
              </form>
            )}
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-card border border-border/60 rounded-sm p-6">
              <h3 className="font-amiri text-2xl text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                ما الذي تتوقعه؟
              </h3>
              <div className="space-y-5">
                {tips.map((tip, i) => {
                  const Icon = tip.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-amiri text-foreground mb-0.5">
                          {tip.titleAr}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tip.textAr}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-sm p-6">
              <h3 className="font-amiri text-2xl text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                زمن الاستجابة
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                أردّ عادةً خلال <span className="text-foreground font-medium">24 ساعة</span>.
                للحجوزات العاجلة في عطلة نهاية الأسبوع يُفضّل إرسال تذكير عبر
                WhatsApp بعد إرسال النموذج.
              </p>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                متاحة لاستقبال الحجوزات
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-sm p-6">
              <h3 className="font-amiri text-2xl text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                معلومات التواصل
              </h3>
              <ul className="space-y-3 text-sm">
                {settings?.contactPhone && (
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                    <a
                      href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`}
                      dir="ltr"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {settings.contactPhone}
                    </a>
                  </li>
                )}
                {settings?.contactEmail && (
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      dir="ltr"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {settings.contactEmail}
                    </a>
                  </li>
                )}
                {settings?.contactAddress && (
                  <li className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">
                      {settings.contactAddress}
                    </span>
                  </li>
                )}
                {settings?.contactWhatsapp && (
                  <li className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <a
                      href={`https://wa.me/${settings.contactWhatsapp.replace(/[^+\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="text-foreground hover:text-green-500 transition-colors"
                    >
                      {settings.contactWhatsapp}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <Link
              href="/#portfolio"
              className="block bg-card border border-border/60 rounded-sm p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-amiri text-foreground mb-1">
                    استعرض أعمالي السابقة
                  </div>
                  <p className="text-xs text-muted-foreground">
                    قبل الحجز، ألقِ نظرة على معرض الأعمال
                  </p>
                </div>
                <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
