"use client";

import { useEffect, useRef, useState } from "react";

const services = [
  {
    title: "Property Buying",
    text: "From showings to negotiations, you get end-to-end support so your purchase is strategic and stress-free."
  },
  {
    title: "Property Selling",
    text: "Pricing strategy, premium marketing, and buyer qualification designed to move your listing confidently."
  },
  {
    title: "Real Estate Investments",
    text: "Analyze rental potential, renovation opportunities, and long-term upside before you commit capital."
  },
  {
    title: "Market Analysis",
    text: "Get local pricing intelligence, neighborhood trends, and timing guidance based on up-to-date demand data."
  },
  {
    title: "Relocation Services",
    text: "Personalized area tours, school and lifestyle guidance, and relocation planning for a smooth transition."
  }
];

export function ServicesAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const [heights, setHeights] = useState<number[]>(services.map(() => 0));
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const measure = () => {
      setHeights(contentRefs.current.map((node) => node?.scrollHeight ?? 0));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section id="services" className="section container">
      <div className="section-heading stacked">
        <p className="kicker">Services</p>
        <h2>Expert guidance tailored to every stage of your real estate journey</h2>
      </div>

      <div className="services-list">
        {services.map((service, index) => {
          const open = openIndex === index;

          return (
            <article key={service.title} className={`service-item ${open ? "open" : ""}`}>
              <button
                type="button"
                className="service-trigger"
                onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                aria-expanded={open}
              >
                <span>{service.title}</span>
                <span className="service-icon" aria-hidden="true">
                  {open ? "−" : "+"}
                </span>
              </button>

              <div
                ref={(node) => {
                  contentRefs.current[index] = node;
                }}
                className="service-content"
                style={{ maxHeight: open ? `${heights[index] ?? 0}px` : "0px" }}
              >
                <p>{service.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
