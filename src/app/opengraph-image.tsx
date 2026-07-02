import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "مريم | Maryam Photography — Yemeni Visual Storyteller";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://maryam-photography.vercel.app";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 45%, oklch(0.16 0.02 285), oklch(0.08 0.005 285))",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Decorative gold ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 460,
            height: 460,
            borderRadius: "50%",
            border: "1px solid oklch(0.78 0.13 75 / 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 380,
              height: 380,
              borderRadius: "50%",
              border: "1px solid oklch(0.78 0.13 75 / 0.25)",
            }}
          />
        </div>

        {/* Top tagline */}
        <div
          style={{
            position: "absolute",
            top: 80,
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "oklch(0.78 0.13 75)",
            fontSize: 16,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 40, height: 1, background: "oklch(0.78 0.13 75)" }} />
          <span>YEMENI VISUAL STORYTELLER</span>
          <span style={{ width: 40, height: 1, background: "oklch(0.78 0.13 75)" }} />
        </div>

        {/* Main name — Arabic "مريم" in serif gold */}
        <div
          style={{
            fontSize: 220,
            fontWeight: 700,
            color: "oklch(0.85 0.12 80)",
            textShadow: "0 0 40px oklch(0.78 0.13 75 / 0.4)",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          مريم
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 24,
            fontSize: 44,
            fontWeight: 400,
            letterSpacing: 12,
            color: "oklch(0.78 0.13 75)",
            textTransform: "uppercase",
          }}
        >
          Maryam Photography
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "oklch(0.62 0.01 80)",
            fontSize: 18,
            letterSpacing: 6,
          }}
        >
          <span style={{ width: 60, height: 1, background: "oklch(0.5 0.01 80 / 0.6)" }} />
          <span>SANA'A · YEMEN</span>
          <span style={{ width: 60, height: 1, background: "oklch(0.5 0.01 80 / 0.6)" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
