"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, MessageCircle, Mail, ArrowUp, Heart, Code2 } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  siteNameAr: string;
  footerCopyright: string;
  contactInstagram: string;
  contactWhatsapp: string;
  contactEmail: string;
};

export function Footer() {
  const [s, setS] = useState<Settings | null>(null);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {});
  }, []);

  const siteNameAr = s?.siteNameAr ?? "مريم";
  const copyright = s?.footerCopyright ?? "© 2024 مريم. جميع الحقوق محفوظة.";

  const instagramHref = s?.contactInstagram && s.contactInstagram !== "#"
    ? (s.contactInstagram.startsWith("http") ? s.contactInstagram : `https://instagram.com/${s.contactInstagram.replace(/^@/, "")}`)
    : "#";
  const whatsappHref = s?.contactWhatsapp && s.contactWhatsapp !== "#"
    ? (s.contactWhatsapp.startsWith("http") ? s.contactWhatsapp : `https://wa.me/${s.contactWhatsapp.replace(/[^+\d]/g, "")}`)
    : "#";
  const emailHref = s?.contactEmail ? `mailto:${s.contactEmail}` : "#";

  const links = [
    { labelAr: "الأعمال", href: "/#portfolio" },
    { labelAr: "عن مريم", href: "/#about" },
    { labelAr: "المدونة", href: "/blog" },
    { labelAr: "احجزي", href: "/booking" },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Single row — brand + links + social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-amiri text-lg text-foreground">{siteNameAr}</span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((l, i) => (
              <Link key={i} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {l.labelAr}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center gap-1">
            <a href={instagramHref} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="WhatsApp">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a href={emailHref} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
              <Mail className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border-r border-border mr-1 pr-2"
              aria-label={t("إلى الأعلى", "To top")}
            >
              <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Bottom — copyright + developer signature */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{copyright}</span>
          <a
            href="https://wa.me/967778140990?text=السلام%20عليكم%20وسيم"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            dir="rtl"
          >
            <Code2 className="w-3 h-3 text-primary/50 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span>{t("صُمّم بـ", "Crafted with")}</span>
            <Heart className="w-3 h-3 fill-red-500/70 text-red-500/70" strokeWidth={0} />
            <span>{t("بواسطة وسيم الزبيري", "by Wasim Al-Zubairi")}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
