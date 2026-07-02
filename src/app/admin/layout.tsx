"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Image,
  Briefcase,
  MessageSquare,
  Settings,
  Home,
  LogOut,
  Camera,
  Menu,
  X,
  Sparkles,
  Mail,
  Shield,
  Database,
  Heart,
  Code2,
  MessageCircle,
  PenSquare,
  CalendarCheck,
} from "lucide-react";

const navItems = [
  { href: "/admin", labelAr: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/hero", labelAr: "القسم الرئيسي", icon: Sparkles },
  { href: "/admin/about", labelAr: "من أنا", icon: Camera },
  { href: "/admin/projects", labelAr: "الأعمال", icon: Image },
  { href: "/admin/blog", labelAr: "المدونة", icon: PenSquare },
  { href: "/admin/bookings", labelAr: "الحجوزات", icon: CalendarCheck },
  { href: "/admin/services", labelAr: "الخدمات", icon: Briefcase },
  { href: "/admin/testimonials", labelAr: "آراء العملاء", icon: MessageSquare },
  { href: "/admin/contact", labelAr: "التواصل والفوتر", icon: Mail },
  { href: "/admin/settings", labelAr: "الإعدادات", icon: Settings },
  { href: "/admin/account", labelAr: "الحساب والأمان", icon: Shield },
  { href: "/admin/data", labelAr: "البيانات والنسخ", icon: Database },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; username: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/admin/login");
        } else {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Login page is standalone — no sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-card border-l border-border z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <Link href="/admin" className="group relative flex items-center gap-3">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md group-hover:bg-primary/20 transition-colors" />
                <svg viewBox="0 0 44 44" className="relative w-full h-full group-hover:rotate-180 transition-transform duration-700">
                  <circle
                    cx="22"
                    cy="22"
                    r="20"
                    fill="none"
                    stroke="oklch(0.78 0.13 75)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="16"
                    fill="none"
                    stroke="oklch(0.78 0.13 75 / 0.3)"
                    strokeWidth="0.5"
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
              <div>
                <div className="font-amiri text-xl text-gold-gradient">
                  مريم
                </div>
                <div className="font-display text-[9px] tracking-[0.3em] text-muted-foreground uppercase flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  Admin Panel
                </div>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="px-2 mb-2 mt-1">
              <span className="font-inter text-[9px] tracking-[0.4em] text-muted-foreground/50 uppercase">
                Menu
              </span>
            </div>
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300 overflow-hidden ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground border border-transparent"
                    }`}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.span
                        layoutId="active-nav"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full"
                      />
                    )}
                    <div className={`relative w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                      isActive
                        ? "bg-primary/15"
                        : "bg-transparent group-hover:bg-primary/10"
                    }`}>
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "scale-105" : ""}`} />
                    </div>
                    <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.labelAr}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              عرض الموقع
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
            {user && (
              <div className="pt-3 mt-3 border-t border-border text-xs text-muted-foreground">
                <div className="text-foreground font-medium">
                  {user.name || user.username}
                </div>
                <div className="font-inter">@{user.username}</div>
              </div>
            )}

            {/* Developer signature */}
            <a
              href="https://wa.me/967778140990?text=السلام%20عليكم%20وسيم،%20شفت%20لوحة%20تحكم%20مريم%20وأعجبني%20عملك"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 hover:text-primary transition-colors pt-3 mt-3 border-t border-border/40"
              dir="rtl"
            >
              <Code2 className="w-3 h-3 text-primary/50 group-hover:text-primary transition-colors" />
              <span>صُمّم بكل</span>
              <Heart className="w-3 h-3 fill-red-500/70 text-red-500/70 group-hover:scale-110 transition-transform" />
              <span>بواسطة</span>
              <span className="font-amiri text-xs text-primary/90 group-hover:text-primary group-hover:underline underline-offset-2 transition-all">
                وسيم الزبيري
              </span>
              <MessageCircle className="w-2.5 h-2.5 text-green-500/60 group-hover:text-green-500 transition-colors" />
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-amiri text-lg text-gold-gradient">لوحة التحكم</div>
          <Link
            href="/"
            target="_blank"
            className="w-10 h-10 flex items-center justify-center text-muted-foreground"
          >
            <Home className="w-5 h-5" />
          </Link>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
