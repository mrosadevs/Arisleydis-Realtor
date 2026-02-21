import { FeaturedProperties } from "@/components/FeaturedProperties";
import { ParallaxHero } from "@/components/ParallaxHero";
import { Reveal } from "@/components/Reveal";
import { ResourcesHub } from "@/components/ResourcesHub";
import { ServicesAccordion } from "@/components/ServicesAccordion";
import { listProperties } from "@/lib/property-store";

export const dynamic = "force-dynamic";

const fallbackHero =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=80";

export default async function HomePage() {
  const properties = await listProperties();
  const heroImage = properties[0]?.images[0] ?? fallbackHero;

  return (
    <>
      <ParallaxHero backgroundImage={heroImage} />

      <main>
        <section id="about" className="section container about-grid">
          <Reveal>
            <div>
              <p className="kicker">About Arisleydis Cruz</p>
              <h2>Committed to relationships, results, and smart decisions.</h2>
              <p>
                Every buyer and seller receives a tailored strategy rooted in local market expertise and clear
                communication. The focus is always on protecting your goals while making the process smooth.
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={180}>
            <div className="about-panel">
              <h3>Mission</h3>
              <p>
                To deliver a high-touch real estate experience where clients feel informed, represented, and confident
                from the first consultation to closing day.
              </p>

              <h3>Values</h3>
              <ul>
                <li>Integrity in every recommendation</li>
                <li>Fast, transparent communication</li>
                <li>Market-driven pricing and negotiation</li>
                <li>Long-term client relationships</li>
              </ul>
            </div>
          </Reveal>
        </section>

        <Reveal>
          <FeaturedProperties properties={properties} />
        </Reveal>

        <Reveal>
          <ServicesAccordion />
        </Reveal>

        <Reveal>
          <ResourcesHub />
        </Reveal>

        <section className="section container testimonial-section">
          <div className="testimonial-card">
            <p>
              “Arisleydis guided us through every step with so much care and strategy. We found the right house and
              closed with confidence.”
            </p>
            <span>Recent Buyer, Charlotte County</span>
          </div>
        </section>

        <section id="contact" className="section container contact-section">
          <div className="contact-panel">
            <div>
              <p className="kicker">Contact</p>
              <h2>Ready to buy, sell, or rent in Florida?</h2>
              <p>
                Reach out directly for showings, listing consultations, market insights, and next-step guidance. You
                will get clear communication and fast follow-up.
              </p>
            </div>

            <div className="contact-detail-grid">
              <article className="contact-detail-card">
                <h3>Phone</h3>
                <p>
                  <a href="tel:+17864583373">(786) 458-3373</a>
                </p>
              </article>

              <article className="contact-detail-card">
                <h3>Email</h3>
                <p>
                  <a href="mailto:info@arisleydisrealtor.com">info@arisleydisrealtor.com</a>
                </p>
              </article>

              <article className="contact-detail-card">
                <h3>Location</h3>
                <p>Port Charlotte, FL</p>
              </article>
            </div>

            <div className="contact-actions">
              <a className="btn btn-primary" href="tel:+17864583373">
                Call Now
              </a>
              <a className="btn btn-secondary" href="mailto:info@arisleydisrealtor.com">
                Send Email
              </a>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <p className="kicker">Contact</p>
              <h3>Let’s find your next home in Florida.</h3>
              <p>Port Charlotte, FL</p>
              <p>
                Phone: <a href="tel:+17864583373">(786) 458-3373</a>
              </p>
              <p>
                Email: <a href="mailto:info@arisleydisrealtor.com">info@arisleydisrealtor.com</a>
              </p>
            </div>

            <div>
              <p className="kicker">Follow</p>
              <ul className="footer-links">
                <li>
                  <a
                    href="https://www.facebook.com/people/Arisleydis-Cruz-Perez-Realtor/61562930196659/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/arisleydisrealtor/" target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="kicker">Legal</p>
              <ul className="footer-links">
                <li>Change Log</li>
                <li>Licenses</li>
                <li>Legal Disclaimer</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
