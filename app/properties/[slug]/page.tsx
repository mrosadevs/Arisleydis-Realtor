import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyGallery } from "@/components/PropertyGallery";
import { getPropertyBySlug } from "@/lib/property-store";

export const dynamic = "force-dynamic";

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug);

  if (!property) {
    notFound();
  }

  return (
    <main className="property-page container">
      <Link href="/" className="back-link">
        Back to homepage
      </Link>

      <div className="property-header-grid">
        <div>
          <p className="kicker">{property.status}</p>
          <h1>{property.title}</h1>
          <p className="property-address">{property.address}</p>
        </div>

        <div className="property-stat-card">
          <p className="property-price-xl">{currency(property.price)}</p>
          <div className="property-meta large">
            <span>{property.beds} Beds</span>
            <span>{property.baths} Baths</span>
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
          <p>{property.type}</p>
        </div>
      </div>

      <PropertyGallery title={property.title} images={property.images} />

      <section className="property-info-grid">
        <article>
          <h2>Description</h2>
          <p>{property.description}</p>
        </article>

        <aside>
          <h2>Highlights</h2>
          <ul>
            {property.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
