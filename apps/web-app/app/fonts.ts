import { Inter } from "next/font/google";
import { Poppins } from "next/font/google";
import { Roboto } from "next/font/google";
import { Montserrat } from "next/font/google";
import { Open_Sans } from "next/font/google";
import { DM_Sans } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { Lora } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Source_Sans_3 } from "next/font/google";
import { Work_Sans } from "next/font/google";
import { Urbanist } from "next/font/google";
import { Manrope } from "next/font/google";
import { Outfit } from "next/font/google";
import { Nunito } from "next/font/google";

// Define font loaders
const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const opensans = Open_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-opensans",
  display: "swap",
});

const dmsans = DM_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

const spacegrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-spacegrotesk",
  display: "swap",
});

const lora = Lora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourcesans = Source_Sans_3({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sourcesans",
  display: "swap",
});

const worksans = Work_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-worksans",
  display: "swap",
});

const urbanist = Urbanist({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const manrope = Manrope({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const nunito = Nunito({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// Export all fonts
export const FONT_LIBRARY = {
  inter,
  poppins,
  roboto,
  montserrat,
  opensans,
  dmsans,
  spacegrotesk,
  lora,
  playfair,
  sourcesans,
  worksans,
  urbanist,
  manrope,
  outfit,
  nunito,
};
