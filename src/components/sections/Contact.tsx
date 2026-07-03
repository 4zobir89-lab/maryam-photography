"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Send, Check, Loader2, Instagram, MessageCircle } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  contactTitleAr: string;
  contactSubtitleEn: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactInstagram: string;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

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
      if (!res.ok) throw new Error("فشل الإرسال");
      setSent(true);
      setForm({ name: "", phone: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch {
      setError("خطأ في الإرسال");
    } finally {
      setSending(false);
    }
  };

  if (loading || !s) {
    return (
      <section id="contact" className="py-32 md:py-48 bg-background">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const instagramHref = s.contactInstagram && s.contactInstagram !== "#"
    ? (s.contactInstagram.startsWith("http") ? s.contactInstagram : `https://instagram.com/${s.contactInstagram.replace(/^@/, "")}`)
    : "#";
  const whatsappHref = s.contactWhatsapp && s.contactWhatsapp !== "#"
    ? (s.contactWhatsapp.startsWith("http") ? s.contactWhatsapp : `https://wa.me/${s.contactWhatsapp.replace(/[^+\d]/g, "")}`)
    : "#";

  return (
    <section id="contact" className="py-32 md:py-48 bg-background border-t border-border">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center mb-12"
        >
          <span className="eyebrow mb-3 block">{s.contactSubtitleEn}</span>
          <h2 className="section-title mb-4">
            <span className="text-gold-gradient">لنبدأ</span>{" "}
            <span className="text-foreground">حكايتك</span>
          </h2>
          <p className="body-lg">{t("املئي النموذج وسأعود إليك خلال 24 ساعة.", "Fill the form and I'll get back to you within 24 hours.")}</p>
        </motion.div>

        {/* Form — single column, 3 fields only */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block eyebrow mb-2">{t("الاسم", "Name")} <span className="text-primary">*</span></label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("مثال: أحمد علي", "e.g. Ahmed Ali")}
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block eyebrow mb-2">{t("الهاتف", "Phone")} <span className="text-primary">*</span></label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+967 77 123 4567"
              dir="ltr"
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-right"
            />
          </div>

          <div>
            <label className="block eyebrow mb-2">{t("رسالتك", "Message")} <span className="text-primary">*</span></label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={t("أخبريني عن مشروعك...", "Tell me about your project...")}
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={sent || sending}
            className={`w-full py-3.5 font-medium transition-all duration-300 motion-ease flex items-center justify-center gap-2.5 disabled:opacity-60 ${
              sent ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {sent ? (
              <>
                <Check className="w-4 h-4" />
                {t("تم الإرسال", "Sent")}
              </>
            ) : sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("جاري الإرسال...", "Sending...")}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" strokeWidth={1.5} />
                {t("إرسال", "Send")}
              </>
            )}
          </button>
        </motion.form>

        {/* Contact info — inline below form */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-center gap-6 text-sm"
        >
          <a href={`mailto:${s.contactEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Mail className="w-4 h-4" strokeWidth={1.5} />
            <span dir="ltr">{s.contactEmail}</span>
          </a>
          <a href={`tel:${s.contactPhone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-4 h-4" strokeWidth={1.5} />
            <span dir="ltr">{s.contactPhone}</span>
          </a>
          <div className="flex items-center gap-1">
            <a href={instagramHref} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="WhatsApp">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
