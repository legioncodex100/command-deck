import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { ProjectProvider } from "@/hooks/useProject";

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
    /* 
      NOTE: Font variables are applied to HTML (root) to ensuring global availability for Tailwind 
      and to support the universal font reset in globals.css. Do not move to body.
    */
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body
        className="antialiased h-full flex bg-background text-foreground"
      >
        <ProjectProvider>
          <Sidebar />
          <main className="flex-1 ml-16 h-screen overflow-hidden flex flex-col">
            <div className="mx-auto max-w-6xl p-8 w-full flex flex-col h-full">
              <GlobalHeader />
              <div className="flex-1 overflow-hidden min-h-0">
                {children}
              </div>
            </div>
          </main>
        </ProjectProvider>
      </body>
    </html>
  );
}
