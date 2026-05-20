import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppProviders } from "./providers";
import MainAppLayout from "@/components/crm/MainAppLayout";

export const metadata: Metadata = {
  title: "FixFlo CRM",
  description: "CRM система для управління сервісним центром",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo/logo-with-bg-no-text.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo/logo-with-bg-no-text.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/logo/logo-with-bg-no-text.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AppProviders>
          <MainAppLayout>{children}</MainAppLayout>
        </AppProviders>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
