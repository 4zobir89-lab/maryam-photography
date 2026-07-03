"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

type NavItem = {
  id: string;
  labelAr: string;
  labelEn: string;
  href?: string;
};

const navItems: NavItem[] = [
  { id: "home", labelAr: "الرئيسية", labelEn: "Home" },
  { id: "about", labelAr: "عن مريم", labelEn: "About" },
  { id: "portfolio", labelAr: "الأعمال", labelEn: "Work" },
  { id: "services", labelAr: "الخدمات", labelEn: "Services" },
  { id: "testimonials", labelAr: "العملاء", labelEn: "Clients" },
  { id: "blog", labelAr: "المدونة", labelEn: "Journal", href: "/blog" },
  { id: "contact", labelAr: "تواصل", labelEn: "Contact" },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = navItems
        .filter((n) => !n.href)
        .map((n) => document.getElementById(n.id))
        .filter(Boolean) as HTMLElement[];
      const offset = window.innerHeight * 0.35;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top <= offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      setMenuOpen(false);
    } else {
      scrollTo(item.id);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 motion-ease ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("home");
            }}
            className="flex items-center gap-2.5 group"
            aria-label="مريم — الرئيسية"
          >
            <svg viewBox="0 0 36 36" className="w-8 h-8 transition-transform duration-700 group-hover:rotate-180">
              <circle cx="18" cy="18" r="16.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
              <text
                x="18"
                y="24"
                textAnchor="middle"
                fontSize="15"
                fontWeight="500"
                className="fill-foreground"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                م
              </text>
            </svg>
            <div className="flex flex-col leading-none">
              <span className="font-amiri text-base text-foreground">مريم</span>
              <span className="font-inter text-[8px] tracking-[0.28em] text-muted-foreground uppercase mt-0.5">
                Maryam
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = !item.href && activeSection === item.id;
              const content = (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="relative px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 motion-ease block"
                    >
                      {t(item.labelAr, item.labelEn)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item)}
                      className="relative px-3.5 py-2 text-sm transition-colors duration-300 motion-ease"
                    >
                      <span className={isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>
                        {t(item.labelAr, item.labelEn)}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                          transition={{ duration: 0.4, ease: EASE }}
                        />
                      )}
                    </button>
                  )}
                </li>
              );
              return content;
            })}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            <div className="hidden md:flex items-center gap-0.5">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <Link
              href="/booking"
              className="hidden md:inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-xs font-medium tracking-wide hover:opacity-90 transition-opacity duration-300 motion-ease"
            >
              {t("احجزي الآن", "Book Now")}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-foreground"
              aria-label={t("القائمة", "Menu")}
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="h-16 px-5 sm:px-8 flex items-center justify-between border-b border-border">
              <span className="font-amiri text-base text-foreground">مريم</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-foreground"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <ul className="flex-1 flex flex-col items-center justify-center gap-2">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: EASE }}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-amiri text-3xl text-foreground hover:text-primary transition-colors duration-300"
                    >
                      {t(item.labelAr, item.labelEn)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item)}
                      className="font-amiri text-3xl text-foreground hover:text-primary transition-colors duration-300"
                    >
                      {t(item.labelAr, item.labelEn)}
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
              className="p-8 border-t border-border flex items-center justify-between"
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
