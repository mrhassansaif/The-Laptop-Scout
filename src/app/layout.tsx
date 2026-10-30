import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

import { AuthProvider } from "@/components/auth/auth-provider";
import {
  BrowserSupportBootstrap,
  BrowserSupportMessage,
} from "@/components/browser/browser-support-bootstrap";
import { ThemeProvider } from "@/components/theme/theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LaptopScout",
    template: "%s · LaptopScout",
  },
  description: "Track store visits and laptop finds in the field.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <BrowserSupportBootstrap />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased`}
      >
        <BrowserSupportMessage />
        <noscript>
          <div className="flex min-h-dvh items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card px-5 py-5 text-sm shadow-sm">
              <p className="font-medium text-foreground">JavaScript required</p>
              <p className="mt-2 leading-6 text-muted-foreground">
                Enable JavaScript to use LaptopScout.
              </p>
            </div>
          </div>
        </noscript>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
