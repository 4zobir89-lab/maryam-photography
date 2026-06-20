"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في تسجيل الدخول");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background film-grain relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-[oklch(0.78_0.13_75_/_0.08)] blur-[150px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full bg-[oklch(0.55_0.1_40_/_0.06)] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-auto px-6"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4"
          >
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle
                cx="40"
                cy="40"
                r="38"
                fill="none"
                stroke="oklch(0.78 0.13 75)"
                strokeWidth="1"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="oklch(0.78 0.13 75 / 0.3)"
                strokeWidth="0.5"
              />
              <text
                x="40"
                y="52"
                textAnchor="middle"
                className="font-display fill-[oklch(0.85_0.12_80)]"
                fontSize="36"
                fontWeight="700"
              >
                M
              </text>
            </svg>
          </motion.div>
          <h1 className="font-amiri text-4xl text-gold-gradient mb-2">
            لوحة التحكم
          </h1>
          <p className="font-display text-xs tracking-[0.4em] text-muted-foreground uppercase">
            Admin Panel · Maryam
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-sm p-8 space-y-5"
        >
          {/* Username */}
          <div>
            <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
              اسم المستخدم
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="maryam"
                className="w-full pr-10 pl-4 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs tracking-widest text-muted-foreground uppercase mb-2 font-inter">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                required
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-10 py-3 bg-background/50 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-sm p-3 text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full py-3.5 bg-primary text-primary-foreground rounded-full font-medium tracking-wide transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                جاري الدخول...
              </span>
            ) : (
              <>
                دخول إلى اللوحة
                <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6 leading-loose">
          منطقة إدارة خاصة بمريم · للاستفسار عن بيانات الدخول
          <br />
          تواصل مع المطور
        </p>
      </motion.div>
    </div>
  );
}
