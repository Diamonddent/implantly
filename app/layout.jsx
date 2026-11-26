import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { PwaRegister } from "@/components/PwaRegister";
import { Localizer } from "@/components/Localizer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  title: "Implantly — Case Compass",
  description: "From clinical input to a ready-to-order implant kit.",
  applicationName: "Implantly",
  appleWebApp: { capable: true, title: "Implantly", statusBarStyle: "black-translucent" },
  icons: {
    apple: `${base}/icons/apple-touch-icon.png`,
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f17",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Suspense fallback={<div className="h-[73px] border-b border-border/60" />}>
          <Navbar />
        </Suspense>
        {children}
        <Toaster richColors position="top-right" />
        <PwaRegister />
        <Localizer />
      </body>
    </html>
  );
}
