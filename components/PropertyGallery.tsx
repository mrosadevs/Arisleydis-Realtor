"use client";

import { useState } from "react";

type PropertyGalleryProps = {
  title: string;
  images: string[];
};

export function PropertyGallery({ title, images }: PropertyGalleryProps) {
  const [active, setActive] = useState(images[0] ?? "");

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="property-gallery">
      <img src={active} alt={title} className="property-gallery-main" />

      <div className="property-gallery-strip">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            className={`property-thumb ${active === image ? "active" : ""}`}
            onClick={() => setActive(image)}
          >
            <img src={image} alt={title} />
          </button>
        ))}
      </div>
    </div>
  );
}
