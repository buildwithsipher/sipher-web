import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { SipherEnergyProvider } from "@/contexts/SipherEnergyContext";
import { ErrorBoundary } from "@/components/error-boundary";
import { SkipNavigation } from "@/components/skip-navigation";
import { CommandPalette } from "@/components/ui/command-palette";
import { AnalyticsWrapper } from "@/components/analytics-wrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sipher.in"),
  title: "Sipher - Where Execution Becomes Credential",
  description:
    "The operating system for India's founders. Proof over promises.",
  keywords: [
    "startup",
    "founder",
    "india",
    "proof of execution",
    "buildlog",
    "vc funding",
  ],
  authors: [{ name: "Sipher", url: "https://sipher.in" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sipher.in",
    siteName: "Sipher",
    title: "Sipher - Where Execution Becomes Credential",
    description: "The operating system for India's founders.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sipher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sipher - Where Execution Becomes Credential",
    description: "The operating system for India's founders.",
    images: ["/og-image.png"],
    creator: "@sipher",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Sipher",
              url: "https://sipher.in",
              logo: "https://sipher.in/logo.jpg",
              description: "The operating system for India's founders. Where execution becomes credential.",
              sameAs: [
                "https://twitter.com/sipher",
                "https://linkedin.com/company/sipher",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ErrorBoundary>
          <SkipNavigation />
          <SipherEnergyProvider>
            <div id="main-content">
              {children}
            </div>
            <CommandPalette />
          </SipherEnergyProvider>
          <Toaster position="bottom-right" theme="dark" richColors />
          <AnalyticsWrapper />
        </ErrorBoundary>
      </body>
    </html>
  );
}

