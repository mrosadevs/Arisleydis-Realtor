import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"]
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"]
});

// TODO: Update metadataBase with your live domain
export const metadata: Metadata = {
  title: "Arisleydis Cruz | Florida Real Estate",
  description:
    "Arisleydis Cruz - Your trusted realtor in Florida. Buy, sell, and invest with personalized guidance and exclusive property listings across the Gulf Coast.",
  openGraph: {
    title: "Arisleydis Cruz | Florida Real Estate",
    description:
      "Your trusted realtor in Florida. Buy, sell, and invest with personalized guidance and exclusive property listings across the Gulf Coast.",
    siteName: "Arisleydis Cruz Realty",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arisleydis Cruz | Florida Real Estate",
    description:
      "Your trusted realtor in Florida. Buy, sell, and invest with personalized guidance and exclusive listings.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
