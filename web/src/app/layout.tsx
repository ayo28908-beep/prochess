import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout";
import { Footer } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { LocalBusinessJsonLd, OrganizationJsonLd } from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Prochess — Nigeria's Premier Chess Academy",
    template: "%s | Prochess",
  },
  description:
    "Learn chess with Nigeria's best coaches. FIDE Infinite Chess Project partner. Structured courses, live tournaments, daily puzzles.",
  keywords: [
    "chess",
    "Nigeria",
    "FIDE",
    "chess academy",
    "chess tournament",
    "learn chess",
    "Prochess",
    "Ibadan",
  ],
  metadataBase: new URL("https://prochess-lovat.vercel.app"),
  openGraph: {
    title: "Prochess — Nigeria's Premier Chess Academy",
    description:
      "Learn chess with Nigeria's best coaches. FIDE Infinite Chess Project partner.",
    url: "https://prochess-lovat.vercel.app",
    siteName: "Prochess",
    images: [{ url: "/images/logo.png", width: 1110, height: 1028, alt: "Prochess" }],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prochess — Nigeria's Premier Chess Academy",
    description:
      "Learn chess with Nigeria's best coaches. FIDE Infinite Chess Project partner.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <LocalBusinessJsonLd />
        <OrganizationJsonLd />
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
