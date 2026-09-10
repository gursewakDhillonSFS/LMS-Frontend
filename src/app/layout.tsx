import "@ant-design/v5-patch-for-react-19";
// app/layout.tsx
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fjalla_One,
  Poppins,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import "react-phone-input-2/lib/style.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const plus_jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const fjallaOne = Fjalla_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fjalla-one",
});

export const metadata: Metadata = {
  title: "Learning+ — Professional Learning Management System",
  description:
    "Start, switch, or advance your career with professional courses, certifications, and degrees from world-class instructors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fjallaOne.variable} ${poppins.variable} ${plus_jakarta.variable} antialiased scrollbar-hide`}
        style={{ fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          {" "}
          <Provider>{children}</Provider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
