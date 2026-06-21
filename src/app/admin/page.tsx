"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Image,
  Briefcase,
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  ArrowLeft,
  Edit3,
  Trash2,
  LogIn,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
} from "lucide-react";

type ActivityLog = {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  username: string;
  createdAt: string;
};

// Render a relative "time ago" string in Arabic (best-effort, no external dep)
function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (!then) return "";
  const diffMs = Date.now() - then;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "قبل لحظات";
  const min = Math.floor(sec / 60);
  if (min < 60) return `قبل ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `قبل ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `قبل ${day} يوم`;
  const month = Math.floor(day / 30);
  if (month < 12) return `قبل ${month} شهر`;
  return `قبل ${Math.floor(month / 12)} سنة`;
}

// Pick an icon for an activity entry based on action
function iconForAction(action: string) {
  const a = action.toLowerCase();
  if (a.includes("create") || a === "create") return Plus;
  if (a.includes("update") || a === "update") return Edit3;
  if (a.includes("delete") || a === "delete") return Trash2;
  if (a.includes("login") || a === "login") return LogIn;
  if (a.includes("import") || a === "import") return ActivityIcon;
  if (a.includes("reset") || a === "reset") return ActivityIcon;
  return SettingsIcon;
}

// Friendly Arabic label for an entity
function labelForEntity(entity: string): string {
  switch (entity) {
    case "project": return "عمل";
    case "projectImage": return "صورة معرض";
    case "service": return "خدمة";
    case "testimonial": return "رأي عميل";
    case "philosophy": return "بطاقة فلسفة";
    case "settings": return "الإعدادات";
    case "admin": return "الحساب";
    case "data": return "البيانات";
    default: return entity;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    services: 0,
    testimonials: 0,
    featured: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects?all=1").then((r) => r.json()),
      fetch("/api/services?all=1").then((r) => r.json()),
      fetch("/api/testimonials?all=1").then((r) => r.json()),
    ])
      .then(([p, s, t]) => {
        setStats({
          projects: p.length || 0,
          services: s.length || 0,
          testimonials: t.length || 0,
          featured: p.filter((x: { featured?: boolean }) => x.featured).length,
        });
      })
      .finally(() => setLoading(false));

    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => setActivities(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => setActivities([]))
      .finally(() => setActivityLoading(false));
  }, []);

  const cards = [
    {
      labelAr: "إجمالي الأعمال",
      value: stats.projects,
      icon: Image,
      href: "/admin/projects",
      color: "from-[oklch(0.78_0.13_75_/_0.2)] to-transparent",
    },
    {
      labelAr: "الخدمات النشطة",
      value: stats.services,
      icon: Briefcase,
      href: "/admin/services",
      color: "from-[oklch(0.55_0.1_40_/_0.2)] to-transparent",
    },
    {
      labelAr: "آراء العملاء",
      value: stats.testimonials,
      icon: MessageSquare,
      href: "/admin/testimonials",
      color: "from-[oklch(0.4_0.05_285_/_0.2)] to-transparent",
    },
    {
      labelAr: "أعمال مميزة",
      value: stats.featured,
      icon: TrendingUp,
      href: "/admin/projects",
      color: "from-[oklch(0.7_0.1_60_/_0.2)] to-transparent",
    },
  ];

  const quickActions = [
    { labelAr: "إضافة عمل جديد", href: "/admin/projects", icon: Plus },
    { labelAr: "تعديل القسم الرئيسي", href: "/admin/hero", icon: Eye },
    { labelAr: "تعديل بطاقة عن مريم", href: "/admin/about", icon: Eye },
    { labelAr: "تعديل معلومات التواصل", href: "/admin/contact", icon: Eye },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-2">
          Dashboard
        </div>
        <h1 className="font-amiri text-4xl text-foreground mb-2">
          مرحباً بك، <span className="text-gold-gradient">مريم</span>
        </h1>
        <p className="text-muted-foreground">
          لوحة التحكم بإدارة محتوى موقعك. من هنا يمكنك تعديل كل شيء.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={c.href}
                className={`block relative p-6 bg-card border border-border/60 rounded-sm overflow-hidden hover:border-primary/40 transition-colors group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-50`}
                />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="font-display text-3xl text-foreground font-bold mb-1">
                    {loading ? "—" : c.value}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide">
                    {c.labelAr}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-card border border-border/60 rounded-sm p-6"
      >
        <h2 className="font-amiri text-2xl text-foreground mb-5">
          إجراءات سريعة
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link
                key={i}
                href={a.href}
                className="flex items-center justify-between p-4 bg-background/40 border border-border/40 rounded-sm hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{a.labelAr}</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border/60 rounded-sm p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-amiri text-2xl text-foreground flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-primary" />
            النشاط الأخير
          </h2>
        </div>
        {activityLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            لا يوجد نشاط مسجّل بعد. ابدئي بتعديل المحتوى ليظهر هنا.
          </div>
        ) : (
          <ul className="space-y-1">
            {activities.map((a) => {
              const Icon = iconForAction(a.action);
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground">
                      <span className="font-medium">{labelForEntity(a.entity)}</span>{" "}
                      <span className="text-muted-foreground">— {a.details || a.action}</span>
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">
                      @{a.username} · {timeAgo(a.createdAt)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
