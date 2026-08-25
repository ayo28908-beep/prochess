import Link from "next/link";

type Crumb = { label: string; href?: string };

// Visible breadcrumb trail + BreadcrumbList JSON-LD for Google.
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const crumbs = [{ label: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://prochess.ng${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="wrap"
        style={{
          paddingTop: 120,
          paddingBottom: 4,
          fontSize: 12.5,
          color: "var(--muted)",
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            {i > 0 && <span style={{ opacity: 0.5 }}>›</span>}
            {c.href ? (
              <Link href={c.href} style={{ color: "var(--muted)" }}>
                {c.label}
              </Link>
            ) : (
              <span style={{ color: "var(--text)", fontWeight: 700 }}>{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
