import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import BrandLogo from "../components/brand/BrandLogo";

export default function NotFoundPage() {
  return <main className="not-found"><BrandLogo /><span className="not-found__code">404</span><h1>This cycle ends here.</h1><p>The page you requested doesn’t exist or has moved.</p><Link className="button button--primary" to="/"><ArrowLeft size={18} /> Return home</Link></main>;
}
