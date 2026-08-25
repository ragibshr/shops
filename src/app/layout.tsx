import type { Metadata } from "next";
import { Baloo_Da_2, Hind_Siliguri } from "next/font/google";
import { getTenant } from "@/lib/tenant-server";
import "./globals.css";

const hind = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

const baloo = Baloo_Da_2({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-balloo",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  return {
    metadataBase: new URL(`https://${tenant.domain}`),
    title: {
      default: `${tenant.nameBn} — ${tenant.taglineBn}`,
      template: `%s · ${tenant.nameBn}`,
    },
    description: tenant.metaDescriptionBn,
    openGraph: {
      siteName: tenant.nameBn,
      locale: "bn_BD",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const tenant = await getTenant();

  return (
    <html
      lang="bn"
      data-theme={tenant.slug}
      className={`${hind.variable} ${baloo.variable}`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
