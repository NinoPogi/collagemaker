import type { Metadata } from "next";
import { Atma } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";

const atma = Atma({
  weight: "400",
  variable: "--font-atma",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Collage Maker",
  description: "Create Collages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${atma.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <Header />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
