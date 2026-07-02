// JSON-LD structured data component for SEO.
// Renders schema.org scripts for Person, WebSite, LocalBusiness, and
// optional BreadcrumbList (used on blog detail pages).

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://maryam-photography.vercel.app";

function Script({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Maryam",
        alternateName: "مريم",
        jobTitle: "Photographer",
        description:
          "مصورة فوتوغرافية يمنية. بصريات سينمائية تلتقط الروح اليمنية والعالمية.",
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sana'a",
          addressCountry: "YE",
        },
        knowsAbout: [
          "Wedding Photography",
          "Portrait Photography",
          "Cultural Photography",
          "Landscape Photography",
        ],
        sameAs: [
          "https://www.instagram.com/",
          "https://www.behance.net/",
          "https://www.youtube.com/",
        ],
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Maryam Photography",
        alternateName: "مريم | مصورة فوتوغرافية",
        url: SITE_URL,
        inLanguage: "ar",
        description:
          "مريم — مصورة فوتوغرافية يمنية. بصريات سينمائية تلتقط الروح اليمنية والعالمية.",
        publisher: {
          "@type": "Person",
          name: "Maryam",
        },
      }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Maryam Photography",
        alternateName: "مريم للتصوير",
        image: `${SITE_URL}/opengraph-image`,
        url: SITE_URL,
        telephone: "+967-1-000-000",
        priceRange: "$$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sana'a",
          addressCountry: "YE",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Saturday",
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
            ],
            opens: "09:00",
            closes: "21:00",
          },
        ],
        founder: {
          "@type": "Person",
          name: "Maryam",
        },
      }}
    />
  );
}

type Crumb = { name: string; url: string };

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

/**
 * Convenience wrapper that renders the three site-wide schemas
 * (Person + WebSite + LocalBusiness). Used in the root layout.
 */
export function SiteJsonLd() {
  return (
    <>
      <PersonJsonLd />
      <WebsiteJsonLd />
      <LocalBusinessJsonLd />
    </>
  );
}
