"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Service", href: "/#services" },
  { label: "Resources", href: "/#resources" },
  { label: "Properties", href: "/#featured" },
  { label: "Contact", href: "/#contact" }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLinkClick(): void {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link href="/" className="brand" onClick={handleLinkClick}>
          Arisleydis Cruz
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="main-navigation" className={`nav-links ${menuOpen ? "open" : ""}`}>
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={handleLinkClick}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
