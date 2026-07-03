"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Instagram, Send, MessageCircle, Check, Loader2, Clock, LucideIcon,
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

const services = ["تصوير أعراس", "بورتريه فردي", "تصوير تجاري", "ورش عمل", "أخرى"];
const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", service: services[0], message: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      setForm({ name: "", email: "", phone: "", service: services[0], message: "" });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
    } finally {
      setSending(false);
    }
  };

  if (loading || !s) {
    return (
      <section id="contact" className="py-32 md:py-48 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const contactInfo: ContactItem[] = [
    { icon: Mail, labelAr: "البريد", labelEn: "Email", value: s.contactEmail, href: s.contactEmail ? `mailto:${s.contactEmail}` : "#" },
    { icon: Phone, labelAr: "الهاتف", labelEn: "Phone", value: s.contactPhone, href: s.contactPhone ? `tel:${s.contactPhone.replace(/[^+\d]/g, "")}` : "#" },
    { icon: MapPin, labelAr: "الموقع", labelEn: "Studio", value: s.contactAddress, href: "#" },
  ];

  const instagramHref = s.contactInstagram && s.contactInstagram !== "#"
    ? (s.contactInstagram.startsWith("http") ? s.contactInstagram : `https://instagram.com/${s.contactInstagram.replace(/^@/, "")}`)
    : "#";
  const whatsappHref = s.contactWhatsapp && s.contactWhatsapp !== "#"
    ? (s.contactWhatsapp.startsWith("http") ? s.contactWhatsapp : `https://wa.me/${s.contactWhatsapp.replace(/[^+\d]/g, "")}`)
    : "#";

  return (
    <section id="contact" className="relative py-32 md:py-48 bg-background overflow-hidden border-t border-border">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-primary/[0.05] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-accent/[0.04] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-20 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-primary/60" />
            <span className="eyebrow">{s.contactSubtitleEn}</span>
          </div>
          <h2 className="section-title mb-8">
            <span className="text-gold-gradient">لنبدأ</span>{" "}
            <span className="text-foreground">حكايتك</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t(
              "كل حكاية تستحق أن تُروى بصريًا. املئي النموذج وسأعود إليك خلال 24 ساعة.",
              "Every story deserves to be told visually. Fill the form and I'll get back to you within 24 hours."
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Contact info — glass cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-3">
              {contactInfo.map((c, i) => {
                const Icon = c.icon;
                return (
                  <a
                    key={i}
                    href={c.href}
                    className="group flex items-center gap-4 p-5 glass rounded-2xl hover:border-primary/40 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="eyebrow mb-1">{c.labelEn}</div>
                      <div className="text-foreground text-base font-medium truncate" dir="auto">
                        {c.value || "—"}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social */}
            <div>
              <div className="eyebrow mb-4">{t("تابعي الرحلة", "Follow the Journey")}</div>
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
                      className="w-11 h-11 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
                    >
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Studio hours */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <span className="eyebrow">Studio Hours</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-foreground">{t("السبت – الخميس", "Sat – Thu")}</span>
                  <span className="text-muted-foreground font-inter" dir="ltr">9:00 – 19:00</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-foreground">{t("الجمعة", "Friday")}</span>
                  <span className="text-muted-foreground">{t("مغلق", "Closed")}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form — luxury glass card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleSubmit}
              className="glass-strong rounded-3xl p-8 md:p-10 space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block eyebrow mb-3">
                    {t("الاسم الكامل", "Full Name")} <span className="text-primary">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("مثال: أحمد علي", "e.g. Ahmed Ali")}
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block eyebrow mb-3">
                    {t("رقم الهاتف", "Phone")} <span className="text-primary">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+967 77 123 4567"
                    dir="ltr"
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block eyebrow mb-3">
                  {t("البريد الإلكتروني", "Email")}{" "}
                  <span className="text-muted-foreground/60">({t("اختياري", "optional")})</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-right"
                />
              </div>

              <div>
                <label className="block eyebrow mb-4">{t("نوع الخدمة", "Service Type")}</label>
                <div className="flex flex-wrap gap-2">
                  {services.map((srv) => (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => setForm({ ...form, service: srv })}
                      className={`px-4 py-2 text-sm rounded-full transition-all duration-300 motion-ease ${
                        form.service === srv
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block eyebrow mb-3">
                  {t("رسالتك", "Your Message")} <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("أخبريني عن مشروعك أو مناسبتك...", "Tell me about your project or occasion...")}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={sent || sending}
                className={`group w-full py-4 rounded-full font-medium tracking-wide transition-all duration-500 motion-ease flex items-center justify-center gap-3 disabled:opacity-60 ${
                  sent ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:opacity-90 shadow-gold"
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
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                    {t("إرسال الرسالة", "Send Message")}
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                {t(
                  "بالإرسال أنت توافق على سياسة الخصوصية. لن تُشارك بياناتك.",
                  "By submitting you agree to the privacy policy. Your data is never shared."
                )}
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
