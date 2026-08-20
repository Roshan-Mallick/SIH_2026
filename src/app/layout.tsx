import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeInit from "@/components/ThemeInit";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aegis — AI Code Security",
  description: "Aegis PreFlight puts AI coding agents inside a controlled sandbox.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <head>
        {/* We can inject a script here to run before hydration to avoid dark/light flash, but for now simple client effect is ok, or we do dangerouslySetInnerHTML */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('aegis-theme') === 'light') {
                  document.body.classList.add('light-mode');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
