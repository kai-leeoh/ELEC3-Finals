import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import SiteNav from "../components/SiteNav";
import SplashScreen from "../components/SplashScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pau Cutz",
  description: "Book a haircut at Pau Cutz barber shop.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f1d1b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SplashScreen />
        <div className="shell">
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  );
}
