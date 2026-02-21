import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arisleydis Realtor | Florida Real Estate",
  description:
    "Arisleydis Realtor in Florida. Buy, sell, and invest with personalized guidance and featured property listings."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />

        {children}
      </body>
    </html>
  );
}
