import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VEC 2026 | Value Education Contest",
  description: "Right Values, Bright Future – ISKCON Value Education Contest 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VEC 2026",
  },
  icons: {
    icon: [
      { url: "/assets/icon-512.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/assets/icon-512.png",
    shortcut: "/assets/icon-512.png",
  },
  openGraph: {
    title: "VEC 2026 | Value Education Contest",
    description: "Right Values, Bright Future – ISKCON Value Education Contest 2026",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF8C00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased font-sans`}>
      <head>
        {/* PWA iOS splash support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/assets/icon-512.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
