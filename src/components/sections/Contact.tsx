"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
  Loader2,
  Instagram,
  MessageCircle,
  Clock,
  AlertCircle,
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

type Service = {
  id: number;
  titleAr: string;
  titleEn: string;
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function Contact() {
  const [s, setS] = useState<Settings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const { t } = useLang();

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ])
      .then(([settings, svc]) => {
        setS(settings);
        setServices(Array.isArray(svc) ? svc : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || sent) return;
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
        throw new Error(data?.error || "فشل الإرسال");
      }
      setSent(true);
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ في الإرسال");
    } finally {
      setSending(false);
    }
  };

  if (loading || !s) {
    return (
      <section
        id="contact"
        className="py-24 md:py-36 bg-background border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

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

  const servicePills = [
    ...services.map((svc) => ({
      id: String(svc.id),
      label: svc.titleAr,
    })),
    { id: "other", label: t("أخرى", "Other") },
  ];

  // Two-tone heading from settings — split at last space so the last word gets gold gradient.
  const titleRaw = (s.contactTitleAr || "لنبدأ حكايتك").trim();
  const titleWords = titleRaw.split(/\s+/);
  const titleMain =
    titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : "";
  const titleAccent =
    titleWords.length > 1
      ? titleWords[titleWords.length - 1]
      : titleWords[0] || "";

  return (
    <section
      id="contact"
      className="relative py-24 md:py-36 bg-background border-t border-border overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 right-0 w-[440px] h-[440px] rounded-full bg-primary/[0.06] blur-[150px] pointer-events-none animate-slow-pulse" />
      <div
        className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-accent/[0.05] blur-[150px] pointer-events-none animate-slow-pulse"
        style={{ animationDelay: "2.5s" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-6"
        >
          <span className="w-12 h-px bg-primary/40" />
          <span className="eyebrow">{s.contactSubtitleEn}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="mb-14 max-w-2xl"
        >
          <h2 className="section-title mb-5">
            {titleMain && (
              <span className="text-foreground">{titleMain} </span>
            )}
            <span className="text-gold-gradient">{titleAccent}</span>
          </h2>
          <p className="body-lg">
            {t(
              "املئي النموذج وسأعود إليك خلال 24 ساعة لنحول فكرتك إلى صورة تستحق أن تُروى.",
              "Fill the form and I'll get back to you within 24 hours to turn your idea into a frame worth telling."
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT — Info cards (5/12) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="lg:col-span-5 space-y-4"
          >
            {/* Email */}
            <a
              href={`mailto:${s.contactEmail}`}
              className="glass-card rounded-2xl p-5 flex items-center gap-4 lift-card group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500 motion-ease">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="eyebrow mb-1">{t("البريد", "Email")}</div>
                <div
                  className="font-amiri text-sm text-foreground truncate"
                  dir="ltr"
                >
                  {s.contactEmail}
                </div>
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${s.contactPhone.replace(/[^+\d]/g, "")}`}
              className="glass-card rounded-2xl p-5 flex items-center gap-4 lift-card group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500 motion-ease">
                <Phone className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="eyebrow mb-1">{t("الهاتف", "Phone")}</div>
                <div
                  className="font-amiri text-sm text-foreground"
                  dir="ltr"
                >
                  {s.contactPhone}
                </div>
              </div>
            </a>

            {/* Address */}
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4 lift-card">
              <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="eyebrow mb-1">{t("العنوان", "Studio")}</div>
                <div className="font-amiri text-sm text-foreground">
                  {s.contactAddress}
                </div>
              </div>
            </div>

            {/* Studio hours */}
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4 lift-card">
              <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="eyebrow mb-1">{t("ساعات العمل", "Studio Hours")}</div>
                <div className="text-sm text-foreground leading-relaxed">
                  {t(
                    "السبت — الخميس · 9 صباحًا — 7 مساءً",
                    "Sat — Thu · 9:00 AM — 7:00 PM"
                  )}
                </div>
              </div>
            </div>

            {/* Social icons in glass circles */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-500 motion-ease"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-500 motion-ease"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href={`mailto:${s.contactEmail}`}
                className="glass-card w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-500 motion-ease"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>

          {/* RIGHT — Form (7/12) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleSubmit}
              className="glass-dark rounded-3xl p-8 md:p-10 relative overflow-hidden"
            >
              {/* Inner ambient glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

              <div className="relative space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block eyebrow mb-2 text-white/80">
                      {t("الاسم", "Name")} <span className="text-primary">*</span>
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder={t("مثال: أحمد علي", "e.g. Ahmed Ali")}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:border-primary focus:bg-white/10 transition-colors text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block eyebrow mb-2 text-white/80">
                      {t("الهاتف", "Phone")}{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+967 77 123 4567"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:border-primary focus:bg-white/10 transition-colors text-sm text-right"
                    />
                  </div>
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="block eyebrow mb-2 text-white/80">
                    {t("البريد الإلكتروني (اختياري)", "Email (optional)")}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:border-primary focus:bg-white/10 transition-colors text-sm text-right"
                  />
                </div>

                {/* Service type — pill selectors */}
                <div>
                  <label className="block eyebrow mb-3 text-white/80">
                    {t("نوع الخدمة", "Service Type")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {servicePills.map((pill) => {
                      const active = form.service === pill.label;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              service: active ? "" : pill.label,
                            })
                          }
                          className={`px-4 py-1.5 rounded-full text-xs font-inter tracking-[0.1em] transition-all duration-300 motion-ease ${
                            active
                              ? "bg-primary text-primary-foreground border border-primary"
                              : "border border-white/15 text-white/70 hover:text-white hover:border-primary/50"
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block eyebrow mb-2 text-white/80">
                    {t("رسالتك", "Message")} <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder={t(
                      "أخبريني عن مشروعك...",
                      "Tell me about your project..."
                    )}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:border-primary focus:bg-white/10 transition-colors text-sm resize-none"
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="flex items-center gap-2 text-sm text-red-400"
                    >
                      <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sent || sending}
                  className={`btn-luxury w-full py-4 px-6 rounded-full font-medium text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2.5 transition-all duration-500 motion-ease disabled:opacity-70 ${
                    sent
                      ? "bg-green-600 text-white"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {sent ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t("تم الإرسال بنجاح", "Sent Successfully")}
                    </>
                  ) : sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("جاري الإرسال...", "Sending...")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={1.5} />
                      {t("إرسال الرسالة", "Send Message")}
                    </>
                  )}
                </button>

                {/* Success note */}
                <AnimatePresence>
                  {sent && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="text-center text-xs text-white/60"
                    >
                      {t(
                        "شكرًا لك! سأعود إليك خلال 24 ساعة.",
                        "Thank you! I'll get back to you within 24 hours."
                      )}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
