import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "@/hooks/useProject";
import { DevModeProvider } from "@/hooks/DevModeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Command Deck",
  description: "Architect-Pilot Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} h-full dark`}>
      <body
        className="antialiased h-full flex bg-background text-foreground"
      >
        <ProjectProvider>
          <DevModeProvider>
            {children}
          </DevModeProvider>
        </ProjectProvider>
      </body>
    </html>
  );
}
