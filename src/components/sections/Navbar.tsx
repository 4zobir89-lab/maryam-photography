"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";

type NavItem = {
  id: string;
  labelAr: string;
  labelEn: string;
  href?: string; // If provided, renders as <Link> (separate page). Otherwise, smooth-scrolls to #id.
};

const navItems: NavItem[] = [
  { id: "home", labelAr: "الرئيسية", labelEn: "Home" },
  { id: "about", labelAr: "عن مريم", labelEn: "About" },
  { id: "portfolio", labelAr: "أعمالي", labelEn: "Portfolio" },
  { id: "gallery", labelAr: "المعرض", labelEn: "Gallery", href: "/gallery" },
  { id: "services", labelAr: "الخدمات", labelEn: "Services" },
  { id: "testimonials", labelAr: "آراء العملاء", labelEn: "Testimonials" },
  { id: "blog", labelAr: "المدوّنة", labelEn: "Blog", href: "/blog" },
  { id: "contact", labelAr: "تواصل", labelEn: "Contact" },
];

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
      setScrolled(window.scrollY > 50);

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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  // For items with href, "active" means the pathname matches the href.
  // For items with id, "active" means the in-page section is in view.
  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      // Highlight blog nav when on /blog or /blog/[slug]
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    // On a separate page, never highlight in-page section items.
    if (pathname !== "/") return false;
    return activeSection === item.id;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40 py-3"
            : "bg-transparent py-6"
        }`}
      >
        <nav className="container mx-auto max-w-7xl px-6 flex items-center justify-between">
          {/* Logo */}
          {pathname === "/" ? (
            <button
              onClick={() => scrollTo("home")}
              className="group flex items-center gap-3"
              aria-label="الصفحة الرئيسية"
            >
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg
                  viewBox="0 0 44 44"
                  className="w-full h-full transition-transform duration-700 group-hover:rotate-180"
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="20"
                    fill="none"
                    stroke="oklch(0.78 0.13 75)"
                    strokeWidth="1"
                  />
                  <text
                    x="22"
                    y="29"
                    textAnchor="middle"
                    className="font-display fill-[oklch(0.85_0.12_80)]"
                    fontSize="20"
                    fontWeight="700"
                  >
                    M
                  </text>
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-amiri text-lg text-foreground tracking-wide">
                  {settings?.siteNameAr ?? "مريم"}
                </span>
                <span className="font-display text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                  {settings?.siteNameEn ?? "Maryam"}
                </span>
              </div>
            </button>
          ) : (
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="الصفحة الرئيسية"
            >
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg
                  viewBox="0 0 44 44"
                  className="w-full h-full transition-transform duration-700 group-hover:rotate-180"
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="20"
                    fill="none"
                    stroke="oklch(0.78 0.13 75)"
                    strokeWidth="1"
                  />
                  <text
                    x="22"
                    y="29"
                    textAnchor="middle"
                    className="font-display fill-[oklch(0.85_0.12_80)]"
                    fontSize="20"
                    fontWeight="700"
                  >
                    M
                  </text>
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-amiri text-lg text-foreground tracking-wide">
                  {settings?.siteNameAr ?? "مريم"}
                </span>
                <span className="font-display text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                  {settings?.siteNameEn ?? "Maryam"}
                </span>
              </div>
            </Link>
          )}

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const active = isActive(item);
              const inner = (
                <>
                  {t(item.labelAr, item.labelEn)}
                  <span
                    className={`absolute -bottom-1.5 right-0 h-px bg-primary transition-all duration-500 ${
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
                      className="group relative text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollTo(item.id)}
                      className="group relative text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-primary/40 text-primary text-sm font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-full"
            >
              {t("احجز جلسة", "Book a Session")}
            </Link>
            <LanguageToggle className="hidden md:inline-flex" />
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-foreground"
              aria-label="القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-border/40">
              <span className="font-amiri text-xl text-gold-gradient">
                {settings?.siteNameAr ?? "مريم"}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-foreground"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ul className="flex-1 flex flex-col items-center justify-center gap-6">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-3xl font-amiri text-foreground hover:text-gold-gradient transition-colors"
                    >
                      {t(item.labelAr, item.labelEn)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollTo(item.id)}
                      className="text-3xl font-amiri text-foreground hover:text-gold-gradient transition-colors"
                    >
                      {t(item.labelAr, item.labelEn)}
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>
            <div className="px-6 py-8 border-t border-border/40 space-y-4">
              <Link
                href="/booking"
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 bg-primary text-primary-foreground rounded-full font-medium tracking-wide text-center block"
              >
                {t("احجز جلسة تصوير", "Book a Photo Session")}
              </Link>
              <div className="flex justify-center">
                <LanguageToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
