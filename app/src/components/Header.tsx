"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/generate", label: "Studio" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/chat", label: "Expert" },
  { href: "/baby", label: "Baby" },
  { href: "/builder", label: "Builder" },
  { href: "/favorites", label: "Favorites" },
  { href: "/account", label: "Account" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="wordmark">
          <span className="orb" aria-hidden />
          AI Naming Studio
        </Link>
        <nav className="nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} data-active={path?.startsWith(l.href)}>
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
