"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

type NavItem = {
  id: string;
  labelAr: string;
  labelEn: string;
  href?: string; // If provided, renders as <Link> (separate page). Otherwise, smooth-scrolls to #id.
};

// Editorial nav: in-page sections + blog as a separate route.
const navItems: NavItem[] = [
  { id: "home", labelAr: "الرئيسية", labelEn: "Home" },
  { id: "about", labelAr: "عن مريم", labelEn: "About" },
  { id: "portfolio", labelAr: "أعمالي", labelEn: "Portfolio" },
  { id: "services", labelAr: "الخدمات", labelEn: "Services" },
  { id: "testimonials", labelAr: "آراء العملاء", labelEn: "Testimonials" },
  { id: "blog", labelAr: "المدوّنة", labelEn: "Blog", href: "/blog" },
  { id: "contact", labelAr: "تواصل", labelEn: "Contact" },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Refined SVG circle + "M" + stacked name. Pure presentational mark. */
function LogoMark({
  siteNameAr,
  siteNameEn,
}: {
  siteNameAr: string;
  siteNameEn: string;
}) {
  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 36 36" className="w-9 h-9 text-foreground" aria-hidden>
        <circle
          cx="18"
          cy="18"
          r="16.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="transition-opacity duration-500 group-hover:opacity-60"
        />
        <text
          x="18"
          y="24"
          textAnchor="middle"
          className="font-display fill-current"
          fontSize="16"
          fontWeight="600"
        >
          M
        </text>
      </svg>
      <span className="flex flex-col leading-none gap-0.5">
        <span className="font-amiri text-base text-foreground">{siteNameAr}</span>
        <span className="font-inter text-[9px] tracking-[0.35em] text-muted-foreground uppercase">
          {siteNameEn}
        </span>
      </span>
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const pathname = usePathname();
  const { t } = useLang();
  const [settings, setSettings] = useState<{
    siteNameAr: string;
    siteNameEn: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) =>
        setSettings({
          siteNameAr: d.siteNameAr ?? "مريم",
          siteNameEn: d.siteNameEn ?? "Maryam",
        })
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Only track in-page sections (skip items with href — they're separate pages)
      const sectionItems = navItems.filter((s) => !s.href);
      const sections = sectionItems
        .map((s) => document.getElementById(s.id))
        .filter((el): el is HTMLElement => !!el);
      const offset = window.innerHeight * 0.4;
      let current = "home";
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.getBoundingClientRect().top <= offset) {
          current = sectionItems[i].id;
          break;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    if (pathname !== "/") return false;
    return activeSection === item.id;
  };

  const siteNameAr = settings?.siteNameAr ?? "مريم";
  const siteNameEn = settings?.siteNameEn ?? "Maryam";

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,padding] duration-500 motion-ease ${
          scrolled
            ? "bg-background/80 backdrop-blur-sm border-b border-border py-3"
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <nav className="container mx-auto max-w-7xl px-6 flex items-center justify-between gap-6">
          {/* Logo — wraps the shared mark in either a button (in-page) or Link (other routes) */}
          {pathname === "/" ? (
            <button
              onClick={() => scrollTo("home")}
              className="group"
              aria-label="الصفحة الرئيسية"
            >
              <LogoMark siteNameAr={siteNameAr} siteNameEn={siteNameEn} />
            </button>
          ) : (
            <Link href="/" className="group" aria-label="الصفحة الرئيسية">
              <LogoMark siteNameAr={siteNameAr} siteNameEn={siteNameEn} />
            </Link>
          )}

          {/* Desktop nav links — horizontal, opposite the logo */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const active = isActive(item);
              const inner = (
                <>
                  <span
                    className={`font-amiri text-sm transition-colors duration-300 motion-ease ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t(item.labelAr, item.labelEn)}
                  </span>
                  <span
                    aria-hidden
                    className={`absolute -bottom-1.5 start-0 h-[2px] bg-primary transition-[width] duration-400 motion-ease ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </>
              );
              return (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="group relative inline-flex"
                      aria-current={active ? "page" : undefined}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollTo(item.id)}
                      className="group relative inline-flex"
                      aria-current={active ? "true" : undefined}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* CTA + lang + mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle className="hidden md:inline-flex" />
            <ThemeToggle className="hidden md:flex" />
            <Link
              href="/booking"
              className="hidden md:inline-flex items-center px-5 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-pale transition-colors duration-300 motion-ease rounded-md"
            >
              {t("احجز جلسة", "Book a Session")}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
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
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Header bar — brand on right (RTL start), close on left (RTL end) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="flex items-center gap-3">
                <span className="font-amiri text-base text-foreground">{siteNameAr}</span>
                <span className="font-inter text-[9px] tracking-[0.35em] text-muted-foreground uppercase">
                  {siteNameEn}
                </span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Centered nav items with stagger */}
            <ul className="flex-1 flex flex-col items-center justify-center gap-5">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE }}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-amiri text-3xl text-foreground hover:text-primary transition-colors duration-300 motion-ease"
                    >
                      {t(item.labelAr, item.labelEn)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollTo(item.id)}
                      className="font-amiri text-3xl text-foreground hover:text-primary transition-colors duration-300 motion-ease"
                    >
                      {t(item.labelAr, item.labelEn)}
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>

            {/* Bottom: CTA + lang */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + navItems.length * 0.06, duration: 0.5, ease: EASE }}
              className="px-6 py-8 border-t border-border flex flex-col items-center gap-5"
            >
              <Link
                href="/booking"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-pale transition-colors rounded-md"
              >
                {t("احجز جلسة تصوير", "Book a Photo Session")}
              </Link>
              <LanguageToggle />
              <ThemeToggle />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
