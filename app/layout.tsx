import type { Metadata } from "next";
import {
  Atma,
  Roboto,
  Open_Sans,
  Montserrat,
  Playfair_Display,
  Lato,
  Poppins,
  Anton,
  Bebas_Neue,
  Caveat,
  Dancing_Script,
  Indie_Flower,
  Lobster,
  Lora,
  Merriweather,
  Nunito,
  Oswald,
  Pacifico,
  PT_Serif,
  Raleway,
  Shadows_Into_Light,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";

const atma = Atma({
  weight: "400",
  variable: "--font-atma",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  weight: ["400", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
});
const shadowsIntoLight = Shadows_Into_Light({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-shadows",
});
const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});
const indieFlower = Indie_Flower({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-indie",
});
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});
const lobster = Lobster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lobster",
});

export const metadata: Metadata = {
  title: "Collage Maker",
  description: " a collage maker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={` ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} ${oswald.variable} ${raleway.variable} ${nunito.variable} ${merriweather.variable} ${playfairDisplay.variable} ${lora.variable} ${ptSerif.variable} ${shadowsIntoLight.variable} ${pacifico.variable} ${dancingScript.variable} ${indieFlower.variable} ${caveat.variable} ${anton.variable} ${bebasNeue.variable} ${lobster.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
