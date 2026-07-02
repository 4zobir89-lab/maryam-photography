"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden film-grain">
      {/* Decorative gold glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-[oklch(0.05_0_0)] z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[oklch(0.05_0_0)] z-20" />

      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Large ! mark */}
        <div className="font-amiri text-[120px] md:text-[180px] leading-none font-bold mb-4 text-gold-gradient">
          !
        </div>

        {/* Arabic title */}
        <h1 className="font-amiri text-3xl md:text-5xl text-foreground mb-3">
          حدث خطأ ما
        </h1>
        <p className="font-display text-sm md:text-base text-muted-foreground tracking-[0.3em] uppercase mb-8">
          Something went wrong
        </p>

        {/* Subtitle */}
        <p className="text-muted-foreground leading-loose mb-12 max-w-lg mx-auto">
          اعتذر عن هذا الانقطاع المفاجئ. يمكنك المحاولة مرة أخرى أو العودة إلى
          الصفحة الرئيسية. تم تسجيل الخطأ للمراجعة.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-full font-medium tracking-wide hover:bg-primary/90 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            المحاولة مرة أخرى
          </button>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-7 py-3.5 border border-primary/40 text-primary rounded-full font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
