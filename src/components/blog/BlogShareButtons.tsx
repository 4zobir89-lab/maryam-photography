"use client";

import { useState } from "react";
import { MessageCircle, Twitter, Link2, Check } from "lucide-react";

export function BlogShareButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : `https://maryam.photo/blog/${slug}`;

  const text = encodeURIComponent(`${title} — مدوّنة مريم`);
  const encodedUrl = encodeURIComponent(url);

  const shareWhatsapp = `https://wa.me/?text=${text}%20${encodedUrl}`;
  const shareTwitter = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // give up
      }
      document.body.removeChild(textarea);
    }
  };

  const buttons = [
    {
      label: "واتساب",
      icon: MessageCircle,
      href: shareWhatsapp,
      hoverClass: "hover:border-green-500/50 hover:text-green-400",
      external: true,
    },
    {
      label: "X",
      icon: Twitter,
      href: shareTwitter,
      hoverClass: "hover:border-foreground/50 hover:text-foreground",
      external: true,
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs tracking-widest text-muted-foreground uppercase font-inter mr-2">
        شارك
      </span>
      {buttons.map((b) => {
        const Icon = b.icon;
        return (
          <a
            key={b.label}
            href={b.href}
            target={b.external ? "_blank" : undefined}
            rel={b.external ? "noopener noreferrer" : undefined}
            aria-label={`مشاركة عبر ${b.label}`}
            className={`w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-all duration-300 ${b.hoverClass}`}
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
      <button
        onClick={copyLink}
        aria-label="نسخ الرابط"
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
          copied
            ? "border-green-500/50 text-green-400"
            : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
