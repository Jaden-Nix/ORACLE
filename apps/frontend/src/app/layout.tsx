import type { Metadata } from "next";

import { Cinzel, Manrope, Space_Mono } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { CopilotKitProviderShell } from "@/components/copilot/CopilotKitProviderShell";
import "./globals.css";
import "@copilotkit/react-core/v2/styles.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
  weight: ["400", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "ORACLE | Generative UI Hackathon",
  description: "An agent-directed cinematic generative UI built with CopilotKit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cinzel.variable} ${spaceMono.variable} ${GeistMono.variable}`}
    >
      <body className="subpixel-antialiased">
        <CopilotKitProviderShell>{children}</CopilotKitProviderShell>
      </body>
    </html>
  );
}
