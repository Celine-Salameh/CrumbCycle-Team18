import { Link } from "react-router-dom";

export default function BrandLogo({ compact = false, light = false }) {
  return (
    <Link className={`brand-logo ${compact ? "brand-logo--compact" : ""} ${light ? "brand-logo--light" : ""}`} to="/" aria-label="CrumbCycle home">
      <span className="brand-logo__crop" aria-hidden="true">
        <img src="/crumbcycle-logo.png" alt="" />
      </span>
      {compact && <span className="brand-logo__compact-text">CrumbCycle</span>}
    </Link>
  );
}
