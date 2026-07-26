import { Inter, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Georgian fonts
export const bpgNinoMtavruli = localFont({
  src: "../assets/fonts/bpg_nino_mtavruli_normal.otf",
  variable: "--font-bpg-nino-mtavruli",
  display: "swap",
  weight: "400 700",
});

export const bpgGlaho = localFont({
  src: "../assets/fonts/bpg_glaho.ttf",
  variable: "--font-bpg-glaho",
  display: "swap",
  weight: "400 700",
});
