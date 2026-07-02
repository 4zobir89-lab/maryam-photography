"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    const initial: Theme = stored || "dark";
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggle = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  if (!mounted) {
    return <div className={`w-9 h-9 ${className}`} />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      className={`w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-md ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} />
      ) : (
        <Moon className="w-[18px] h-[18px]" strokeWidth={1.5} />
      )}
    </button>
  );
}
