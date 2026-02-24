"use client";

import { useState, useCallback } from "react";

type PropertyGalleryProps = {
  title: string;
  images: string[];
};

export function PropertyGallery({ title, images }: PropertyGalleryProps) {
  const [active, setActive] = useState(images[0] ?? "");
  const [fading, setFading] = useState(false);

  const switchImage = useCallback(
    (nextImage: string) => {
      if (nextImage === active) return;
      setFading(true);

      const timeout = setTimeout(() => {
        setActive(nextImage);
        setFading(false);
      }, 250);

      return () => clearTimeout(timeout);
    },
    [active]
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="property-gallery">
      <img
        src={active}
        alt={title}
        className="property-gallery-main"
        style={{ opacity: fading ? 0.3 : 1 }}
      />

      <div className="property-gallery-strip">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            className={`property-thumb ${active === image ? "active" : ""}`}
            onClick={() => switchImage(image)}
          >
            <img src={image} alt={title} />
          </button>
        ))}
      </div>
    </div>
  );
}
