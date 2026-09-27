import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Abdul Muqsit · Software Engineer — MB-AM01 Mainboard",
  description:
    "Interactive 3D portfolio of Abdul Muqsit, a full-stack software engineer (web & mobile) from Islamabad. Explore the mechanical motherboard: CPU, memory, PCIe projects and fiber I/O.",
  openGraph: {
    title: "Abdul Muqsit · MB-AM01",
    description: "A portfolio built as a living, mechanical motherboard.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
