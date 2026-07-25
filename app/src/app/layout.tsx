import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AI Naming Studio — Every name has a story",
  description:
    "The premium AI naming platform for parents, writers, and worldbuilders. Generate baby names, character names, kingdoms, spaceships, and brands — with meaning, origin, and the story behind every name.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b14" },
  ],
  viewportFit: "cover",
};

const themeInit = `(function(){try{var t=localStorage.getItem('ans.theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            AI Naming Studio · Every name has a story. · <a href="/generate">Studio</a> · <a href="/pricing">Pricing</a> · <a href="/privacy">Privacy</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
