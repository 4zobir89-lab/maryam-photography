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

  // Submit → save to DB + open WhatsApp with prefilled message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!s) return;
    setSending(true);
    try {
      // Save message to DB (admin can view in panel)
      await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch(() => {}); // non-blocking — WhatsApp is the primary channel

      // Build WhatsApp message
      const waNumber = (s.contactWhatsapp || "").replace(/[^+\d]/g, "");
      const lines = [
        `السلام عليكم مريم،`,
        ``,
        `الاسم: ${form.name}`,
        form.email ? `البريد: ${form.email}` : "",
        form.phone ? `الهاتف: ${form.phone}` : "",
        `نوع الخدمة: ${form.service}`,
        ``,
        `الرسالة:`,
        form.message,
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join("\n"));
      const waUrl = waNumber
        ? `https://wa.me/${waNumber}?text=${text}`
        : `https://wa.me/?text=${text}`;

      // Open WhatsApp in new tab
      window.open(waUrl, "_blank", "noopener,noreferrer");

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          service: services[0],
          message: "",
        });
      }, 5000);
    } finally {
      setSending(false);
    }
  };

  if (loading || !s) {
    return (
      <section
        id="contact"
        className="relative py-32 md:py-44 bg-background overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
    <section
      id="contact"
      className="relative py-32 md:py-44 bg-background overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.78_0.13_75_/_0.05)] blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[oklch(0.55_0.1_40_/_0.05)] blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — {lang === "en" ? s.contactTitleAr : s.contactSubtitleEn} —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            {(() => {
              const title = lang === "en" ? s.contactSubtitleEn : s.contactTitleAr;
              const parts = (title || "").split(" ");
              const first = parts.shift() || "";
              const rest = parts.join(" ");
              return (
                <>
                  <span className="text-gold-gradient">{first}</span>
                  {rest && (
                    <>
                      {" "}
                      <span className="text-foreground">{rest}</span>
                    </>
                  )}
                </>
              );
            })()}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-loose">
            {t(
              "كل حكاية تستحق أن تُروى بصريًا. تواصل معي لنحوّ لحظاتك إلى ذكريات تُحفظ عبر الزمن.",
              "Every story deserves to be told visually. Reach out to turn your moments into memories that last."
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h3 className="font-amiri text-3xl text-foreground mb-3">
                معلومات التواصل
              </h3>
              <p className="text-sm text-muted-foreground leading-loose">
                أسرد لي رؤيتك، وسأُهيّئ العدسة لتناسبها. عند الضغط على "إرسال"
                سيتم فتح WhatsApp برسالة جاهزة لإرسالها مباشرة.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((c, i) => {
                const Icon = c.icon;
                return (
                  <a
                    key={i}
                    href={c.href}
                    className="flex items-center gap-4 p-4 border border-border/60 rounded-sm hover:border-primary/40 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-muted-foreground tracking-widest uppercase font-inter mb-1">
                        {c.labelEn}
                      </div>
                      <div className="text-foreground font-medium">
                        {c.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.labelAr}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social */}
            <div className="pt-4">
              <div className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-3 font-inter">
                Follow the Journey
              </div>
              <div className="flex items-center gap-3">
                {[
                  { icon: Instagram, label: "Instagram", href: instagramHref },
                  { icon: MessageCircle, label: "WhatsApp", href: whatsappHref },
                  { icon: Mail, label: "Email", href: s.contactEmail ? `mailto:${s.contactEmail}` : "#" },
                ].map((soc, i) => {
                  const Icon = soc.icon;
                  return (
                    <a
                      key={i}
                      href={soc.href}
                      target={soc.href.startsWith("http") ? "_blank" : undefined}
                      rel={soc.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      aria-label={soc.label}
                      className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:scale-110 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Studio hours */}
            <div className="pt-4 border-t border-border/40">
              <div className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-2 font-inter">
                Studio Hours
              </div>
              <div className="text-sm text-foreground space-y-1">
                <div className="flex justify-between">
                  <span>السبت - الخميس</span>
                  <span className="text-muted-foreground">9 ص - 7 م</span>
                </div>
                <div className="flex justify-between">
                  <span>الجمعة</span>
                  <span className="text-muted-foreground">مغلق</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="relative glass-card rounded-sm p-8 md:p-10 space-y-6"
            >
              {/* WhatsApp banner */}
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-sm">
                <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-xs text-green-400 leading-relaxed">
                  عند الإرسال سيتم فتح <strong>WhatsApp</strong> برسالة جاهزة لإرسالها
                  مباشرة إلى مريم. سيتم أيضًا حفظ نسخة في لوحة التحكم.
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
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-right"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                  نوع الخدمة
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map((srv) => (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => setForm({ ...form, service: srv })}
                      className={`px-4 py-2 text-sm border rounded-full transition-all ${
                        form.service === srv
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
                  رسالتك *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="أخبرني عن مشروعك أو مناسبتك..."
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sent || sending}
                className={`group w-full py-4 rounded-full font-medium tracking-wide transition-all duration-500 flex items-center justify-center gap-3 ${
                  sent
                    ? "bg-green-600 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                }`}
              >
                {sent ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t(
                      "تم فتح WhatsApp — أكملي الإرسال من هناك",
                      "WhatsApp opened — finish sending from there"
                    )}
                  </>
                ) : sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("جاري التحضير...", "Preparing...")}
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    {t("إرسال عبر WhatsApp", "Send via WhatsApp")}
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                {t(
                  'بالضغط على "إرسال عبر WhatsApp" سيتم فتح المحادثة برسالة جاهزة. لن تُشارك بياناتك مع أي طرف ثالث.',
                  'Clicking "Send via WhatsApp" opens the chat with a pre-filled message. Your data is never shared with third parties.'
                )}
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
