interface JsonLdProps {
  type: string;
  data: Record<string, unknown>;
}

export default function JsonLd({ type, data }: JsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      type="LocalBusiness"
      data={{
        name: "Prochess Academy",
        image: "https://prochess-lovat.vercel.app/images/logo.png",
        url: "https://prochess-lovat.vercel.app",
        telephone: ["+2348081635986", "+2348055170872"],
        email: "info@prochess.ng",
        address: {
          "@type": "PostalAddress",
          streetAddress: "38 Ifelodun Street",
          addressLocality: "Orogun",
          addressRegion: "Ibadan",
          addressCountry: "NG",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 7.3775,
          longitude: 3.9470,
        },
        sameAs: [
          "https://chessstream-africa.vercel.app",
        ],
        description: "Nigeria's premier chess academy. FIDE Infinite Chess Project partner.",
        priceRange: "$$",
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "18:00",
        },
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      type="Organization"
      data={{
        name: "Prochess Academy",
        url: "https://prochess-lovat.vercel.app",
        logo: "https://prochess-lovat.vercel.app/images/logo.png",
        description: "Nigeria's premier chess academy. FIDE Infinite Chess Project partner.",
        founder: {
          "@type": "Person",
          name: "Olalekan Adeyemi",
        },
        sameAs: [
          "https://chessstream-africa.vercel.app",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: ["+2348081635986", "+2348055170872"],
          email: "info@prochess.ng",
        },
      }}
    />
  );
}
