"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const navItems = [
  { id: "home", labelAr: "الرئيسية", labelEn: "Home", href: "/" },
  { id: "about", labelAr: "عن مريم", labelEn: "About", href: "/#about" },
  { id: "portfolio", labelAr: "الأعمال", labelEn: "Portfolio", href: "/#portfolio" },
  { id: "services", labelAr: "الخدمات", labelEn: "Services", href: "/#services" },
  { id: "journal", labelAr: "المدونة", labelEn: "Journal", href: "/blog" },
  { id: "contact", labelAr: "تواصل", labelEn: "Contact", href: "/#contact" },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, lang, toggle } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 motion-ease ${
          scrolled
            ? "py-3 glass-dark shadow-lg shadow-black/5"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <span className={`font-display text-2xl font-light tracking-[0.15em] uppercase ${
              scrolled ? "text-white" : "text-foreground"
            }`}>
              Mariam
            </span>
            <span className="hidden md:block w-8 h-px bg-primary/50 group-hover:w-14 transition-all duration-500" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative text-[13px] font-inter tracking-[0.2em] uppercase transition-colors duration-300 ${
                  scrolled ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {t(item.labelAr, item.labelEn)}
                <span className="absolute -bottom-1 right-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-500 motion-ease" />
              </Link>
            ))}

            {/* Lang toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-2 text-[12px] tracking-[0.15em] uppercase text-primary/80 hover:text-primary transition-colors duration-300 border border-primary/20 px-3 py-1.5 rounded-full hover:border-primary/40"
            >
              <Globe size={13} strokeWidth={1.5} />
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <ThemeToggle />
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`lg:hidden transition-colors ${scrolled ? "text-white/80 hover:text-white" : "text-foreground/80 hover:text-foreground"}`}
            aria-label="Menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col lg:hidden"
          >
            {/* Ambient glow */}
            <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-primary/8 blur-[120px] pointer-events-none" />

            <div className="relative h-16 px-6 flex items-center justify-between border-b border-border">
              <span className="font-display text-2xl font-light tracking-[0.15em] text-foreground uppercase">Mariam</span>
              <button onClick={() => setMenuOpen(false)} className="w-10 h-10 flex items-center justify-center" aria-label="Close">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <ul className="flex-1 flex flex-col items-center justify-center gap-8 relative">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-3xl font-light tracking-[0.15em] text-foreground/80 hover:text-primary transition-colors duration-300"
                  >
                    {t(item.labelAr, item.labelEn)}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
              className="relative p-6 border-t border-border flex items-center justify-center gap-3"
            >
              <button
                onClick={toggle}
                className="flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-primary border border-primary/30 px-5 py-2 rounded-full"
              >
                <Globe size={14} strokeWidth={1.5} />
                {lang === "ar" ? "English" : "عربي"}
              </button>
              <ThemeToggle />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
