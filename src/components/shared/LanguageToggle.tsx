"use client";

import { useLang } from "./LanguageProvider";

/**
 * Small gold-styled toggle button.
 * - When current lang is "ar", shows "EN" (switch to English)
 * - When current lang is "en", shows "ع" (switch to Arabic)
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useLang();
  const label = lang === "ar" ? "EN" : "ع";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary/40 text-primary text-xs font-bold tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-inter ${className}`}
    >
      {label}
    </button>
  );
}
