import "@ant-design/v5-patch-for-react-19";
// app/layout.tsx
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fjalla_One,
  Poppins,
  Plus_Jakarta_Sans,
  Noto_Sans_Gurmukhi,
} from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import "react-phone-input-2/lib/style.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

import JsonLd, { getOrganizationSchema, getWebSiteSchema } from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const plus_jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const fjallaOne = Fjalla_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fjalla-one",
  display: "swap",
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-gurmukhi",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillora.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Skillora — Master In-Demand Tech, Design & Business Skills",
    template: "%s | Skillora",
  },
  description:
    "Start, switch, or advance your career with 1,000+ industry-leading courses, hands-on projects, and verified certificates from expert instructors on Skillora.",
  keywords: [
    "Skillora",
    "online learning platform",
    "tech courses",
    "web development",
    "data science",
    "artificial intelligence",
    "UI UX design",
    "professional certifications",
    "self-paced learning",
  ],
  authors: [{ name: "Skillora Inc." }],
  creator: "Skillora",
  publisher: "Skillora",
  applicationName: "Skillora",
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
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      pa: "/?lang=pa",
      fr: "/?lang=fr",
      "x-default": "/",
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Skillora",
    title: "Skillora — Master In-Demand Tech, Design & Business Skills",
    description:
      "Start, switch, or advance your career with 1,000+ industry-leading courses, hands-on projects, and verified certificates from expert instructors.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Skillora — Modern Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillora — Master In-Demand Tech, Design & Business Skills",
    description:
      "Start, switch, or advance your career with 1,000+ industry-leading courses, hands-on projects, and verified certificates from expert instructors.",
    creator: "@skillora",
    images: ["/images/og-image.jpg"],
  },
};

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const initialLocale =
    localeCookie === "pa" || localeCookie === "fr" ? localeCookie : "en";

  const organizationSchema = getOrganizationSchema(baseUrl);
  const websiteSchema = getWebSiteSchema(baseUrl);

  return (
    <html lang={initialLocale}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <JsonLd id="organization-schema" data={organizationSchema} />
        <JsonLd id="website-schema" data={websiteSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fjallaOne.variable} ${poppins.variable} ${plus_jakarta.variable} ${notoSansGurmukhi.variable} antialiased scrollbar-hide`}
        style={{
          fontFamily:
            "var(--font-geist-sans), var(--font-noto-gurmukhi), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <Provider initialLocale={initialLocale as any}>{children}</Provider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
