import { ArrowLeft, BarChart3, HandHeart, PackageSearch } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import Card from "../components/ui/Card";

const sections = {
  surplus: {
    icon: PackageSearch,
    title: "Surplus workspace",
    copy: "Inventory forecasts and surplus listings will live here as the next product epics are implemented.",
  },
  impact: {
    icon: BarChart3,
    title: "Impact reporting",
    copy: "Detailed recovery, emissions, and community impact reporting will appear here.",
  },
  partners: {
    icon: HandHeart,
    title: "Partner network",
    copy: "Manage NGO and food-bank connections from this workspace in a future product epic.",
  },
};

export default function WorkspaceSectionPage() {
  const { section } = useParams();
  const details = sections[section];
  if (!details) return <Navigate to="/dashboard" replace />;
  const Icon = details.icon;

  return (
    <Card className="workspace-placeholder">
      <span><Icon size={26} /></span>
      <p className="eyebrow">Epic 1 foundation</p>
      <h1>{details.title}</h1>
      <p>{details.copy}</p>
      <Link className="text-link" to="/dashboard"><ArrowLeft size={17} /> Back to overview</Link>
    </Card>
  );
}
