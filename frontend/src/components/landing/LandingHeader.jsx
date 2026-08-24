import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import BrandLogo from "../brand/BrandLogo";

const links = [
  ["About", "#about"],
  ["Features", "#features"],
  ["Solutions", "#solutions"],
  ["Contact Us", "#contact"],
];

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-header">
      <BrandLogo />
      <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="landing-navigation" aria-label="Toggle navigation">
        {menuOpen ? <X /> : <Menu />}
      </button>
      <nav id="landing-navigation" className={`landing-nav ${menuOpen ? "landing-nav--open" : ""}`} aria-label="Primary navigation">
        <div className="landing-nav__links">
          {links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </div>
        <div className="landing-nav__actions">
          <Link className="button button--outline button--small" to="/login">Log in</Link>
          <Link className="button button--primary button--small" to="/signup">Sign up</Link>
        </div>
      </nav>
    </header>
  );
}
