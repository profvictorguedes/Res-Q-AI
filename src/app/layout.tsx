import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Res-Q AI - Dispatch Analysis for First Responders",
  description: "AI-powered dispatch analysis that converts notes into visual scene previews with hazard mapping for first responders",
  keywords: ["emergency response", "dispatch analysis", "first responders", "hazard mapping", "AI"],
  authors: [{ name: "Res-Q AI Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#B91C1C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
