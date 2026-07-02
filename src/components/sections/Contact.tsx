"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Send,
  MessageCircle,
  Check,
  Loader2,
  Clock,
  LucideIcon,
} from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  contactTitleAr: string;
  contactSubtitleEn: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactInstagram: string;
  contactWhatsapp: string;
};

type ContactItem = {
  icon: LucideIcon;
  labelAr: string;
  labelEn: string;
  value: string;
  href: string;
};

const services = [
  "تصوير أعراس",
  "بورتريه فردي",
  "تصوير تجاري",
  "ورش عمل",
  "أخرى",
];

export function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLang();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: services[0],
    message: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Submit → save to DB (admin can view messages in panel)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "فشل الإرسال");
      }
      setSent(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        service: services[0],
        message: "",
      });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading || !s) {
    return (
      <section id="contact" className="relative py-32 md:py-44 bg-background">
        <div className="container mx-auto max-w-6xl px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const contactInfo: ContactItem[] = [
    {
      icon: Mail,
      labelAr: "البريد الإلكتروني",
      labelEn: "Email",
      value: s.contactEmail,
      href: s.contactEmail ? `mailto:${s.contactEmail}` : "#",
    },
    {
      icon: Phone,
      labelAr: "الهاتف",
      labelEn: "Phone",
      value: s.contactPhone,
      href: s.contactPhone
        ? `tel:${s.contactPhone.replace(/[^+\d]/g, "")}`
        : "#",
    },
    {
      icon: MapPin,
      labelAr: "الموقع",
      labelEn: "Studio",
      value: s.contactAddress,
      href: "#",
    },
  ];

  const instagramHref =
    s.contactInstagram && s.contactInstagram !== "#"
      ? s.contactInstagram.startsWith("http")
        ? s.contactInstagram
        : `https://instagram.com/${s.contactInstagram.replace(/^@/, "")}`
      : "#";
  const whatsappHref =
    s.contactWhatsapp && s.contactWhatsapp !== "#"
      ? s.contactWhatsapp.startsWith("http")
        ? s.contactWhatsapp
        : `https://wa.me/${s.contactWhatsapp.replace(/[^+\d]/g, "")}`
      : "#";

  return (
    <section id="contact" className="relative py-32 md:py-44 bg-background">
      {/* Top hairline rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border/40" />

      <div className="container mx-auto max-w-6xl px-6">
        {/* Header — editorial split, not centered */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-20 md:mb-28"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase">
              {s.contactSubtitleEn}
            </span>
            <div className="h-px flex-1 max-w-[80px] bg-primary/40" />
          </div>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold leading-[1.05] mb-8 max-w-3xl">
            <span className="text-gold-gradient">لنبدأ</span>{" "}
            <span className="text-foreground">حكايتك</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            {t(
              "كل حكاية تستحق أن تُروى بصريًا. املئي النموذج وسأعود إليك خلال 24 ساعة.",
              "Every story deserves to be told visually. Fill the form and I'll get back to you within 24 hours."
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* ===== Contact info column ===== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-5 space-y-10"
          >
            {/* Contact items — list with hairline dividers, not cards */}
            <div className="space-y-0">
              {contactInfo.map((c, i) => {
                const Icon = c.icon;
                return (
                  <a
                    key={i}
                    href={c.href}
                    className="group flex items-center gap-5 py-5 border-b border-border/60 first:pt-0 hover:border-primary/40 transition-colors"
                  >
                    <div className="w-11 h-11 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-muted-foreground tracking-[0.25em] uppercase font-inter mb-1">
                        {c.labelEn}
                      </div>
                      <div className="text-foreground text-base font-medium truncate" dir="auto">
                        {c.value || "—"}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social — minimal, no bubbles */}
            <div>
              <div className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-4 font-inter">
                {t("تابع الرحلة", "Follow the Journey")}
              </div>
              <div className="flex items-center gap-2">
                {[
                  { icon: Instagram, label: "Instagram", href: instagramHref },
                  { icon: MessageCircle, label: "WhatsApp", href: whatsappHref },
                  { icon: Mail, label: "Email", href: s.contactEmail ? `mailto:${s.contactEmail}` : "#" },
                ].map((soc, i) => {
                  const Icon = soc.icon;
                  const isExternal = soc.href.startsWith("http") && soc.href !== "#";
                  return (
                    <a
                      key={i}
                      href={soc.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      aria-label={soc.label}
                      className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-sm"
                    >
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Studio hours — editorial block, no card */}
            <div className="pt-8 border-t border-border/40">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-inter">
                  Studio Hours
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-foreground">{t("السبت – الخميس", "Sat – Thu")}</span>
                  <span className="text-muted-foreground font-inter tabular-nums" dir="ltr">9:00 – 19:00</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-foreground">{t("الجمعة", "Friday")}</span>
                  <span className="text-muted-foreground">{t("مغلق", "Closed")}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== Form column ===== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Name + Phone row */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-3 font-inter">
                    {t("الاسم الكامل", "Full Name")} <span className="text-primary">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("مثال: أحمد علي", "e.g. Ahmed Ali")}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-3 font-inter">
                    {t("رقم الهاتف", "Phone")} <span className="text-primary">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+967 77 123 4567"
                    dir="ltr"
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-lg text-right"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-3 font-inter">
                  {t("البريد الإلكتروني", "Email")}{" "}
                  <span className="text-muted-foreground/60">({t("اختياري", "optional")})</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-lg text-right"
                />
              </div>

              {/* Service type — chips */}
              <div>
                <label className="block text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-4 font-inter">
                  {t("نوع الخدمة", "Service Type")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map((srv) => (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => setForm({ ...form, service: srv })}
                      className={`px-4 py-2 text-sm border transition-all duration-300 ${
                        form.service === srv
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-3 font-inter">
                  {t("رسالتك", "Your Message")} <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t(
                    "أخبرني عن مشروعك أو مناسبتك...",
                    "Tell me about your project or occasion..."
                  )}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-lg resize-none leading-relaxed"
                />
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 border-r-2 border-red-500/50 pr-4 py-2"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={sent || sending}
                  className={`group inline-flex items-center gap-3 px-8 py-4 font-medium tracking-wide transition-all duration-500 disabled:opacity-60 ${
                    sent
                      ? "bg-green-600 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {sent ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t("تم الإرسال بنجاح", "Sent successfully")}
                    </>
                  ) : sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("جاري الإرسال...", "Sending...")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      {t("إرسال الرسالة", "Send Message")}
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  {t(
                    "بالإرسال أنت توافق على سياسة الخصوصية. لن تُشارك بياناتك.",
                    "By submitting you agree to the privacy policy. Your data is never shared."
                  )}
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
