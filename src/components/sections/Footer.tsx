"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, MessageCircle, Mail, ArrowUp, Heart, Code2 } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  siteNameAr: string;
  siteNameEn: string;
  footerDesc: string;
  footerCopyright: string;
  contactInstagram: string;
  contactWhatsapp: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Footer() {
  const [s, setS] = useState<Settings | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {});
  }, []);

  const siteNameAr = s?.siteNameAr ?? "مريم";
  const footerDesc = s?.footerDesc ?? "بصريات سينمائية من قلب صنعاء.";
  const footerCopyright = s?.footerCopyright ?? "© 2024 مريم. جميع الحقوق محفوظة.";

  const instagramHref = s?.contactInstagram && s.contactInstagram !== "#"
    ? (s.contactInstagram.startsWith("http") ? s.contactInstagram : `https://instagram.com/${s.contactInstagram.replace(/^@/, "")}`)
    : "#";
  const whatsappHref = s?.contactWhatsapp && s.contactWhatsapp !== "#"
    ? (s.contactWhatsapp.startsWith("http") ? s.contactWhatsapp : `https://wa.me/${s.contactWhatsapp.replace(/[^+\d]/g, "")}`)
    : "#";
  const emailHref = s?.contactEmail ? `mailto:${s.contactEmail}` : "#";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    } catch {}
  };

  const footerCols = [
    {
      titleEn: "Explore",
      titleAr: "استكشف",
      links: [
        { labelAr: "الرئيسية", href: "/" },
        { labelAr: "عن مريم", href: "/#about" },
        { labelAr: "الأعمال", href: "/#portfolio" },
        { labelAr: "المدونة", href: "/blog" },
        { labelAr: "المعرض", href: "/gallery" },
      ],
    },
    {
      titleEn: "Services",
      titleAr: "الخدمات",
      links: [
        { labelAr: "تصوير الأعراس", href: "/#services" },
        { labelAr: "بورتريه", href: "/#services" },
        { labelAr: "تصوير تجاري", href: "/#services" },
        { labelAr: "ورش العمل", href: "/#services" },
        { labelAr: "احجزي جلسة", href: "/booking" },
      ],
    },
    {
      titleEn: "Connect",
      titleAr: "تواصل",
      links: [
        { labelAr: s?.contactEmail || "hello@maryam.photo", href: emailHref },
        { labelAr: s?.contactPhone || "+967 77 123 4567", href: s?.contactPhone ? `tel:${s.contactPhone.replace(/[^+\d]/g, "")}` : "#" },
        { labelAr: s?.contactAddress || "صنعاء · اليمن", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Top — brand + columns */}
        <div className="grid lg:grid-cols-12 gap-12 py-20">
          {/* Brand col */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg viewBox="0 0 36 36" className="w-9 h-9 transition-transform duration-700 group-hover:rotate-180">
                <circle cx="18" cy="18" r="16.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
                <text x="18" y="24" textAnchor="middle" fontSize="15" fontWeight="500" className="fill-foreground" style={{ fontFamily: "var(--font-amiri)" }}>م</text>
              </svg>
              <div>
                <div className="font-amiri text-lg text-foreground">{siteNameAr}</div>
                <div className="font-inter text-[8px] tracking-[0.28em] text-muted-foreground uppercase">Maryam Photography</div>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {footerDesc}
            </p>

            {/* Social — minimal */}
            <div className="flex items-center gap-1">
              {[
                { icon: Instagram, label: "Instagram", href: instagramHref },
                { icon: MessageCircle, label: "WhatsApp", href: whatsappHref },
                { icon: Mail, label: "Email", href: emailHref },
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
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>

            {/* Newsletter — minimal inline */}
            <div className="pt-4 max-w-md">
              <div className="eyebrow mb-3">{t("النشرة البريدية", "Newsletter")}</div>
              <form onSubmit={handleSubscribe} className="flex items-center border-b border-border focus-within:border-primary transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("بريدك لتصلك آخر الأعمال", "Your email for latest work")}
                  className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="text-primary hover:text-primary-pale transition-colors px-2"
                  aria-label={t("اشتراك", "Subscribe")}
                >
                  {subscribed ? "✓" : "←"}
                </button>
              </form>
              {subscribed && (
                <p className="text-xs text-green-400 mt-2">{t("تم الاشتراك بنجاح!", "Subscribed successfully!")}</p>
              )}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerCols.map((col, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              >
                <div className="eyebrow mb-5">{col.titleEn}</div>
                <ul className="space-y-3">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {l.labelAr}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative text-center py-12 border-t border-border overflow-hidden"
        >
          <div
            className="font-amiri font-bold leading-none select-none"
            style={{
              fontSize: "clamp(4rem, 16vw, 13rem)",
              color: "var(--foreground)",
              opacity: 0.04,
            }}
          >
            {siteNameAr}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-inter text-[10px] tracking-[0.5em] text-muted-foreground uppercase">
              — M · A · R · Y · A · M —
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 border-t border-border text-xs text-muted-foreground">
          <span>{footerCopyright}</span>
          <div className="flex items-center gap-6">
            <span className="font-inter tracking-widest uppercase">{t("صُنع في صنعاء", "Crafted in Sana'a")}</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
              aria-label={t("إلى الأعلى", "To top")}
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Developer signature */}
        <div className="py-6 border-t border-border">
          <a
            href="https://wa.me/967778140990?text=السلام%20عليكم%20وسيم،%20شفت%20موقع%20مريم%20وأعجبني%20عملك"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            dir="rtl"
          >
            <Code2 className="w-3 h-3 text-primary/50 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span>{t("صُمّم بكل", "Crafted with")}</span>
            <Heart className="w-3 h-3 fill-red-500/70 text-red-500/70 group-hover:scale-110 transition-transform" strokeWidth={0} />
            <span>{t("وبرمج بواسطة", "& engineered by")}</span>
            <span className="font-amiri text-sm text-primary font-medium group-hover:underline underline-offset-4 transition-all">
              وسيم الزبيري
            </span>
            <MessageCircle className="w-2.5 h-2.5 text-green-500/60 group-hover:text-green-500 transition-colors" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}
