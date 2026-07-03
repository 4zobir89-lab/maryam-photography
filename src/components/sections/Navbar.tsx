"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const navItems = [
  { id: "about", labelAr: "عن مريم", labelEn: "About", href: "/#about" },
  { id: "portfolio", labelAr: "الأعمال", labelEn: "Work", href: "/#portfolio" },
  { id: "services", labelAr: "الخدمات", labelEn: "Services", href: "/#services" },
  { id: "journal", labelAr: "المدونة", labelEn: "Journal", href: "/blog" },
  { id: "contact", labelAr: "تواصل", labelEn: "Contact", href: "/#contact" },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 motion-ease ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border py-3"
            : "bg-transparent py-5"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-amiri text-lg text-foreground">مريم</span>
            <span className="font-inter text-[8px] tracking-[0.3em] text-muted-foreground uppercase hidden sm:inline">Maryam</span>
          </Link>

          {/* Desktop nav — 5 links only */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {t(item.labelAr, item.labelEn)}
                  <span className="absolute -bottom-1.5 right-0 h-px w-0 bg-primary transition-all duration-500 motion-ease group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Right — toggles + CTA */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <Link
              href="/booking"
              className="hidden md:inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity duration-300 motion-ease"
            >
              {t("احجزي", "Book")}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-foreground"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-[60] bg-background flex flex-col lg:hidden"
          >
            <div className="h-16 px-6 flex items-center justify-between border-b border-border">
              <span className="font-amiri text-lg text-foreground">مريم</span>
              <button onClick={() => setMenuOpen(false)} className="w-9 h-9 flex items-center justify-center" aria-label="Close">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <ul className="flex-1 flex flex-col items-center justify-center gap-7">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-amiri text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    {t(item.labelAr, item.labelEn)}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="p-6 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <Link
                href="/booking"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium"
              >
                {t("احجزي جلسة", "Book a Session")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
