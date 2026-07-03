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
import { useLang } from "@/components/shared/LanguageProvider";

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

const EASE = [0.22, 0.61, 0.36, 1] as const;

export default function BookingPage() {
  const { t } = useLang();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
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
    if (!form.name.trim()) return t("الاسم مطلوب", "Name is required");
    if (!form.phone.trim())
      return t("رقم الهاتف مطلوب", "Phone number is required");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return t("البريد الإلكتروني غير صالح", "Invalid email address");
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
        setErrorMsg(
          data.error ||
            t("فشل إرسال الطلب. حاول مرة أخرى.", "Failed to send. Try again.")
        );
        return;
      }
      setSavedBooking({
        id: data.id,
        service: data.service || form.service,
        preferredDate:
          data.preferredDate ||
          (form.preferredDate
            ? new Date(form.preferredDate).toISOString()
            : null),
        name: form.name,
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg(
        t(
          "تعذّر الاتصال بالخادم. حاول مرة أخرى.",
          "Connection failed. Please try again."
        )
      );
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
        : t("تاريخ لم يُحدد بعد", "Date TBD");
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
      titleEn: "Before the session",
      textAr:
        "جهّز أزياء احتياطية وحدّد الأماكن التي ترغب بالتصوير فيها مسبقًا.",
    },
    {
      icon: Sparkles,
      titleAr: "أثناء التصوير",
      titleEn: "During the shoot",
      textAr: "لا تقلق من الوضعيات — مريم ستوجّهك بكل هدوء وراحة.",
    },
    {
      icon: Clock,
      titleAr: "بعد الجلسة",
      titleEn: "After the shoot",
      textAr:
        "ستصلك الصور المختارة خلال 7-14 يومًا للمراجعة قبل التسليم النهائي.",
    },
  ];

  // Underline-style input: transparent bg, bottom border only, primary on focus
  const inputClass =
    "w-full bg-transparent border-0 border-b border-border py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors";
  const labelClass = "block eyebrow mb-2";

  return (
    <main className="relative min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero — editorial left-aligned header */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-primary/60" />
              <span className="eyebrow">BOOK A SESSION</span>
            </div>
            <h1 className="section-title mb-8">
              <span className="text-foreground">احجزي</span>{" "}
              <span className="text-gold-gradient">جلسة تصوير</span>
            </h1>
            <p className="body-lg">
              {t(
                "املأ النموذج التالي وسأتواصل معك خلال 24 ساعة لتأكيد الموعد والتفاصيل. كل حكاية تستحق أن تُروى بإطار لا يُنسى.",
                "Fill out the form below and I'll get back to you within 24 hours to confirm the date and details. Every story deserves an unforgettable frame."
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Two-column layout: form (7/12) + info (5/12) */}
      <section className="pb-28 md:pb-40 bg-background flex-1">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="lg:col-span-7"
            >
              {status === "success" ? (
                <div className="surface-card p-10 md:p-12 min-h-[500px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center border border-primary text-primary mb-6">
                    <Check className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-amiri text-3xl text-foreground mb-3">
                    {t("تم استلام طلبك", "Request received")}
                  </h2>
                  <p className="body-lg max-w-md mb-8">
                    {t(
                      `شكرًا لك يا ${savedBooking?.name}. وصلنا طلبك لحجز جلسة ${serviceLabelAr(
                        savedBooking?.service || form.service
                      )}. سأعود إليك خلال 24 ساعة لتأكيد الموعد.`,
                      `Thank you ${
                        savedBooking?.name
                      }. We received your booking for a ${serviceLabelAr(
                        savedBooking?.service || form.service
                      )} session. We'll get back to you within 24 hours to confirm.`
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-opacity duration-300 motion-ease"
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                      {t(
                        "إرسال تذكير عبر WhatsApp",
                        "Send WhatsApp reminder"
                      )}
                    </a>
                    <button
                      onClick={reset}
                      className="px-6 py-3.5 border border-border text-foreground text-sm font-medium tracking-wide hover:border-primary hover:text-primary transition-all duration-300 motion-ease"
                    >
                      {t("حجز جديد", "New booking")}
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="surface-card p-8 md:p-10 space-y-6"
                >
                  <div className="flex items-center gap-3 pb-5 border-b border-border">
                    <CalendarCheck
                      className="w-5 h-5 text-primary flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(
                        "عند الإرسال سيتم حفظ طلبك. بعدها يمكنك إرسال تذكير سريع عبر WhatsApp لإسراع الرد.",
                        "On submit, your request will be saved. You can then send a quick WhatsApp reminder to speed up the reply."
                      )}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>
                        {t("الاسم الكامل *", "Full name *")}
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder={t("مثال: أحمد علي", "e.g. Ahmed Ali")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t("رقم الهاتف *", "Phone *")}
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+967 77 123 4567"
                        dir="ltr"
                        className={`${inputClass} text-right`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      {t(
                        "البريد الإلكتروني (اختياري)",
                        "Email (optional)"
                      )}
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                      dir="ltr"
                      className={`${inputClass} text-right`}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>
                        {t("نوع الخدمة", "Service type")}
                      </label>
                      <select
                        value={form.service}
                        onChange={(e) => set("service", e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        {serviceOptions.map((s) => (
                          <option key={s.id} value={s.id} className="bg-card">
                            {t(s.labelAr, s.labelEn)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        {t(
                          "التاريخ المفضل (اختياري)",
                          "Preferred date (optional)"
                        )}
                      </label>
                      <input
                        type="date"
                        value={form.preferredDate}
                        onChange={(e) => set("preferredDate", e.target.value)}
                        dir="ltr"
                        className={`${inputClass} text-right`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      {t("الموقع (اختياري)", "Location (optional)")}
                    </label>
                    <input
                      value={form.location}
                      onChange={(e) => set("location", e.target.value)}
                      placeholder={t(
                        "مثال: صنعاء، استوديو مريم...",
                        "e.g. Sana'a, Maryam's studio..."
                      )}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      {t(
                        "تفاصيل إضافية (اختياري)",
                        "Additional details (optional)"
                      )}
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      placeholder={t(
                        "أخبريني عن مناسبتك، عدد الأشخاص، ألوان الأزياء، أو أي تفاصيل تودين مشاركتها...",
                        "Tell me about your event, number of people, outfit colors, or any details you'd like to share..."
                      )}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {status === "error" && errorMsg && (
                    <div className="p-3 border border-destructive/40 text-destructive text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="group w-full py-4 font-medium tracking-wide transition-all duration-500 motion-ease flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          strokeWidth={1.5}
                        />
                        {t("جاري الإرسال...", "Sending...")}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" strokeWidth={1.5} />
                        {t("إرسال الطلب", "Send request")}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-muted-foreground text-center">
                    {t(
                      "بياناتك تُحفظ بسرّية ولن تُشارك مع أي طرف ثالث.",
                      "Your data is kept confidential and never shared with third parties."
                    )}
                  </p>
                </form>
              )}
            </motion.div>

            {/* Info panel */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="lg:col-span-5 space-y-6"
            >
              {/* What to expect */}
              <div className="surface-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles
                    className="w-4 h-4 text-primary"
                    strokeWidth={1.5}
                  />
                  <h3 className="eyebrow">{t("WHAT TO EXPECT", "WHAT TO EXPECT")}</h3>
                </div>
                <div className="space-y-6">
                  {tips.map((tip, i) => {
                    const Icon = tip.icon;
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-9 h-9 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="font-amiri text-lg text-foreground mb-1">
                            {t(tip.titleAr, tip.titleEn)}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {tip.textAr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Response time */}
              <div className="surface-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <h3 className="eyebrow">
                    {t("RESPONSE TIME", "RESPONSE TIME")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {t(
                    "أردّ عادةً خلال 24 ساعة. للحجوزات العاجلة في عطلة نهاية الأسبوع يُفضّل إرسال تذكير عبر WhatsApp بعد إرسال النموذج.",
                    "I usually reply within 24 hours. For urgent weekend bookings, please send a WhatsApp reminder after submitting the form."
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-foreground/80">
                    {t(
                      "متاحة لاستقبال الحجوزات",
                      "Available for new bookings"
                    )}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="surface-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <h3 className="eyebrow">{t("CONTACT", "CONTACT")}</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  {settings?.contactPhone && (
                    <li className="flex items-center gap-3">
                      <Phone
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                        strokeWidth={1.5}
                      />
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
                      <Mail
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                        strokeWidth={1.5}
                      />
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
                      <MapPin
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-foreground">
                        {settings.contactAddress}
                      </span>
                    </li>
                  )}
                  {settings?.contactWhatsapp && (
                    <li className="flex items-center gap-3">
                      <MessageCircle
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <a
                        href={`https://wa.me/${settings.contactWhatsapp.replace(/[^+\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {settings.contactWhatsapp}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Link to portfolio */}
              <Link
                href="/#portfolio"
                className="group block surface-card p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-amiri text-foreground mb-1">
                      {t("استعرض أعمالي السابقة", "View my portfolio")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "قبل الحجز، ألقِ نظرة على معرض الأعمال",
                        "Browse the portfolio before booking"
                      )}
                    </p>
                  </div>
                  <ArrowLeft
                    className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform"
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
