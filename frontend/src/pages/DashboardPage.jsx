import { ArrowDownRight, ArrowUpRight, HandHeart, PackageCheck, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

const trendData = [
  { day: "Mon", rescued: 180, forecast: 206 },
  { day: "Tue", rescued: 240, forecast: 262 },
  { day: "Wed", rescued: 214, forecast: 248 },
  { day: "Thu", rescued: 302, forecast: 320 },
  { day: "Fri", rescued: 338, forecast: 356 },
  { day: "Sat", rescued: 286, forecast: 314 },
  { day: "Sun", rescued: 374, forecast: 390 },
];

const metrics = [
  { label: "Meals redirected", value: "1,934", change: "+18%", icon: UtensilsCrossed, positive: true },
  { label: "Surplus recovered", value: "812 kg", change: "+12%", icon: PackageCheck, positive: true },
  { label: "Active partners", value: "24", change: "+3", icon: HandHeart, positive: true },
];

export default function DashboardPage() {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  function handleForecast(event) {
    event.preventDefault();
    setModalOpen(false);
    showToast("Forecast draft created successfully.");
  }

  return (
    <div className="dashboard">
      <div className="dashboard__heading"><div><span className="eyebrow">Monday, August 17</span><h1>Good morning. Here’s your food impact.</h1><p>Your recovery rate is trending upward this week.</p></div><Button onClick={() => setModalOpen(true)}><Plus size={18} /> New forecast</Button></div>
      <section className="metric-grid" aria-label="Impact summary">
        {metrics.map(({ label, value, change, icon: Icon, positive }) => <Card className="metric-card" key={label}><div className="metric-card__top"><span className="metric-card__icon"><Icon size={21} /></span><span className={`metric-card__change ${positive ? "metric-card__change--positive" : ""}`}>{positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{change}</span></div><strong>{value}</strong><span>{label}</span></Card>)}
      </section>
      <section className="dashboard-grid">
        <Card className="chart-card"><div className="card-heading"><div><h2>Recovery trend</h2><p>Forecasted and rescued meals this week</p></div><span className="chart-legend"><i /> Rescued</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="recoveryFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D94F70" stopOpacity={0.3}/><stop offset="95%" stopColor="#D94F70" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eadfe1"/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#786F7B", fontSize: 12 }}/><YAxis tickLine={false} axisLine={false} tick={{ fill: "#786F7B", fontSize: 12 }}/><Tooltip contentStyle={{ border: "1px solid #eadfe1", borderRadius: 12, boxShadow: "0 12px 30px rgba(36,29,43,.1)" }}/><Area type="monotone" dataKey="rescued" stroke="#D94F70" strokeWidth={3} fill="url(#recoveryFill)"/></AreaChart></ResponsiveContainer></div></Card>
        <Card className="recommendation-card"><span className="recommendation-card__icon"><Sparkles /></span><span className="eyebrow">Smart recommendation</span><h2>Move bakery pickup 45 minutes earlier.</h2><p>Friday’s forecast shows a 14% increase in bread surplus. Partner capacity is available nearby.</p><Button variant="outline" onClick={() => showToast("Recommendation marked for review.")}>Review action</Button></Card>
      </section>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a surplus forecast"><form className="modal-form" onSubmit={handleForecast}><Input id="forecast-category" label="Food category" required placeholder="e.g. Bakery"/><Input id="forecast-quantity" label="Expected quantity (kg)" required min="1" type="number" placeholder="0"/><div className="modal__actions"><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">Create forecast</Button></div></form></Modal>
    </div>
  );
}
