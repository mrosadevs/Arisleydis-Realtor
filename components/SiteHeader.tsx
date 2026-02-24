"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Properties", href: "/#featured" },
  { label: "Services", href: "/#services" },
  { label: "Resources", href: "/#resources" },
  { label: "Contact", href: "/#contact" }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLinkClick(): void {
    setMenuOpen(false);
  }

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-shell">
        <Link href="/" className="brand" onClick={handleLinkClick}>
          Arisleydis Cruz
        </Link>

        <button
          type="button"
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
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
