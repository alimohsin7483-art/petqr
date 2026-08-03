import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics/google-analytics";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { MicrosoftClarity } from "@/components/analytics/clarity";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "PetLink — A tag that talks back",
    template: "%s · PetLink",
  },
  description:
    "Give every pet a secure digital ID. Scan the tag, reach the owner, bring them home.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <head>
        <GoogleTagManager />
      </head>
      <body className="font-body antialiased">
        <GoogleTagManagerNoscript />
        {children}
        <GoogleAnalytics />
        <MetaPixel />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
