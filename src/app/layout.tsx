import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Header, SyncStatusBanner } from "@/components/layout";
import { Toaster } from "@/components/ui";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { AIHealthCall } from "@/components/voice/AIHealthCall";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArogyaSetu - Healthcare Platform",
  description: "AI-powered healthcare platform for patients, hospitals, and government health management",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('ui-storage');
                  if (stored) {
                    var data = JSON.parse(stored);
                    if (data.state && data.state.darkMode) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen pb-32">{children}</main>
          <SyncStatusBanner />
          <Toaster />
          <VoiceAssistant />
          <AIHealthCall />
        </Providers>
      </body>
    </html>
  );
}
