export default function Loading() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-[oklch(0.05_0_0)] z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-[oklch(0.05_0_0)] z-20" />

      <div className="flex flex-col items-center gap-6">
        {/* Gold spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="font-amiri text-lg text-muted-foreground tracking-wide">
          جاري التحميل...
        </p>
      </div>
    </main>
  );
}
