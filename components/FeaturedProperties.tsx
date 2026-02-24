"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Property } from "@/lib/types";

type FeaturedPropertiesProps = {
  properties: Property[];
};

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const cities = useMemo(() => {
    const all = properties.map((property) => property.city).sort((a, b) => a.localeCompare(b));
    return ["All", ...Array.from(new Set(all))];
  }, [properties]);

  const [cityFilter, setCityFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    if (cityFilter === "All") {
      return properties;
    }

    return properties.filter((property) => property.city === cityFilter);
  }, [cityFilter, properties]);

  return (
    <section id="featured" className="section container">
      <div className="section-heading">
        <div>
          <p className="kicker">Featured Properties</p>
          <h2>Exclusive listings curated for you</h2>
        </div>

        <label className="filter-label">
          City
          <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="property-grid">
        {filtered.map((property) => (
          <article key={property.id} className="property-card">
            <div className="property-image-wrap">
              <img src={property.images[0]} alt={property.title} className="property-image" loading="lazy" />
              <span className="property-status">{property.status}</span>
            </div>

            <div className="property-body">
              <div className="property-row">
                <p className="property-price">{currency(property.price)}</p>
                <p className="property-type">{property.type}</p>
              </div>

              <h3>{property.title}</h3>
              <p>{property.address}</p>

              <div className="property-meta">
                <span>{property.beds} Beds</span>
                <span>{property.baths} Baths</span>
                <span>{property.sqft.toLocaleString()} sqft</span>
              </div>

              <Link href={`/properties/${property.slug}`} className="inline-link">
                View details &rarr;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
