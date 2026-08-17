import { ArrowRight, BriefcaseBusiness, Building2, ChartNoAxesCombined, HandHeart, Play, Sparkles, UtensilsCrossed, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";

import LandingHeader from "../components/landing/LandingHeader";

const stats = [
  { icon: UtensilsCrossed, value: "8.7M+", label: "Meals rescued" },
  { icon: BriefcaseBusiness, value: "2.3K+", label: "Businesses" },
  { icon: HandHeart, value: "5.1K+", label: "NGOs & partners" },
  { icon: Warehouse, value: "1.8K+", label: "Food banks" },
];

const features = [
  { icon: ChartNoAxesCombined, title: "Predict surplus", copy: "Turn everyday inventory signals into clear, practical forecasts before food becomes waste." },
  { icon: Sparkles, title: "Act at the right moment", copy: "Get useful recommendations for markdowns, donations, and smarter redistribution." },
  { icon: HandHeart, title: "Reach nearby communities", copy: "Match safe surplus with verified NGOs and food banks ready to receive it." },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-shell">
        <LandingHeader />
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero__copy">
              <span className="eyebrow"><Sparkles size={15} /> Smarter food recovery</span>
              <h1 id="hero-title">
                Predict surplus.
                <span>Prevent waste.</span>
                Feed communities.
              </h1>
              <p>CrumbCycle uses AI to predict food surplus, recommend actions, and connect businesses with NGOs and food banks—turning excess into impact.</p>
              <div className="hero__actions">
                <Link className="button button--primary" to="/signup">See CrumbCycle in action <ArrowRight size={18} /></Link>
                <a className="button button--outline" href="#features">Explore features <Play size={16} fill="currentColor" /></a>
              </div>
            </div>
            <div className="hero__visual" aria-label="Food moving through a cycle from surplus to families">
              <div className="hero__image-halo" />
              <img src="/crumbcycle-hero.png" alt="An illuminated food cycle joining fresh produce with a family receiving a meal" />
              <div className="hero__impact-pill"><span>Today’s potential</span><strong>1,248 meals</strong></div>
            </div>
          </section>

          <section className="impact-strip" aria-label="CrumbCycle impact">
            {stats.map(({ icon: Icon, value, label }) => (
              <div className="impact-stat" key={label}>
                <span className="impact-stat__icon"><Icon size={19} /></span>
                <span><strong>{value}</strong><small>{label}</small></span>
              </div>
            ))}
          </section>

          <section className="content-section" id="features">
            <div className="section-heading">
              <span className="eyebrow">From insight to impact</span>
              <h2>Less waste. More value in every cycle.</h2>
              <p>CrumbCycle gives food businesses one calm, connected workflow for forecasting, action, and community impact.</p>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, copy }, index) => (
                <article className="feature-card" key={title}>
                  <span className="feature-card__number">0{index + 1}</span>
                  <span className="feature-card__icon"><Icon size={24} /></span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="split-section" id="solutions">
            <div>
              <span className="eyebrow eyebrow--light">Built for the whole network</span>
              <h2>One shared system for businesses and community partners.</h2>
            </div>
            <div className="solution-list">
              <article><Building2 size={22} /><div><h3>Food businesses</h3><p>Forecast surplus, reduce loss, and coordinate donations without adding operational friction.</p></div></article>
              <article><HandHeart size={22} /><div><h3>NGOs and food banks</h3><p>See available supply earlier and plan pickups with better confidence.</p></div></article>
            </div>
          </section>

          <section className="about-section" id="about">
            <span className="eyebrow">Why CrumbCycle</span>
            <h2>Food should complete a cycle—not reach a dead end.</h2>
            <p>We help surplus move from shelves and kitchens to people who can use it, with better timing, clearer data, and measurable impact.</p>
            <Link className="text-link" to="/signup">Start your first cycle <ArrowRight size={17} /></Link>
          </section>

          <section className="contact-panel" id="contact">
            <div><span className="eyebrow eyebrow--light">Ready when you are</span><h2>Turn tomorrow’s surplus into today’s opportunity.</h2></div>
            <Link className="button button--light" to="/signup">Create your account <ArrowRight size={18} /></Link>
          </section>
        </main>
        <footer className="landing-footer"><span>© 2026 CrumbCycle</span><span>Predict surplus. Prevent waste. Feed communities.</span></footer>
      </div>
    </div>
  );
}
