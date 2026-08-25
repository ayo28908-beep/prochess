import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import ClerkProviderGuard from "@/components/ClerkProviderGuard";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://prochess.ng"),
  title: {
    default: "Prochess — Learn, Play, Stream, and Master Chess",
    template: "%s · Prochess",
  },
  description:
    "Prochess Academy. Learn, Play, Stream, and Master Chess. Courses, puzzles, tournaments, live games and certified coaching for kids and adults.",
  openGraph: {
    type: "website",
    siteName: "Prochess Academy",
    title: "Prochess — Learn, Play, Stream, and Master Chess",
    description:
      "Nigeria's #1 chess academy — courses, puzzles, live tournaments and certified coaching.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProviderGuard>
          <ConvexClientProvider>
            <Nav />
            <main>{children}</main>
            <Footer />
          </ConvexClientProvider>
        </ClerkProviderGuard>
      </body>
    </html>
  );
}
