import type { Metadata } from "next";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "@fontsource/baloo-da-2/600.css";
import "@fontsource/baloo-da-2/700.css";
import "@fontsource/baloo-da-2/800.css";
import { BRAND } from "@/lib/tenants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${BRAND.domain}`),
  title: {
    default: `${BRAND.nameBn} — ${BRAND.taglineBn}`,
    template: `%s · ${BRAND.nameBn}`,
  },
  description: BRAND.metaDescriptionBn,
  openGraph: {
    siteName: BRAND.nameBn,
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" data-theme="oddbox">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
