"use client";

import { useEffect, useState } from "react";

type ParallaxHeroProps = {
  backgroundImage: string;
};

export function ParallaxHero({ backgroundImage }: ParallaxHeroProps) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        setOffsetY(window.scrollY * 0.25);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section className="hero-shell">
      <div
        className="hero-media"
        style={{
          transform: `translate3d(0, ${offsetY}px, 0) scale(1.1)`,
          backgroundImage: `url(${backgroundImage})`
        }}
      />

      <div className="hero-overlay" />
      <div className="hero-glow" />

      <div className="hero-content container">
        <p className="hero-eyebrow">Florida Real Estate</p>
        <h1>
          Arisleydis<br />
          <span className="hero-gold">Cruz</span>
        </h1>
        <p>
          Personalized guidance for buying, selling, and investing across Port Charlotte, North Port,
          and nearby Gulf Coast communities.
        </p>

        <div className="hero-actions">
          <a href="#featured" className="btn btn-primary">
            View Properties
          </a>
          <a href="#contact" className="btn btn-secondary" style={{ borderColor: "rgba(201,169,110,0.45)", color: "#e8d5a3" }}>
            Book a Consultation
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">100+</span>
            <span className="hero-stat-label">Clients Served</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">5★</span>
            <span className="hero-stat-label">Client Rating</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">5+</span>
            <span className="hero-stat-label">Years in FL</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <div className="hero-scroll-arrow" />
      </div>
    </section>
  );
}
