import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import BrandLogo from "../components/brand/BrandLogo";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      showToast("Welcome back to CrumbCycle.");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <BrandLogo light />
        <div><span className="eyebrow eyebrow--light">Welcome back</span><h1>Keep good food moving forward.</h1><p>See your forecasts, coordinate recovery, and measure your community impact.</p></div>
        <small>Predict surplus · Prevent waste · Feed communities</small>
      </section>
      <section className="auth-form-panel">
        <Link className="back-link" to="/"><ArrowLeft size={17} /> Back to home</Link>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div><span className="eyebrow">Your workspace</span><h2>Log in to CrumbCycle</h2><p>Enter the details connected to your account.</p></div>
          {error && <div className="form-alert" role="alert">{error}</div>}
          <Input id="login-email" label="Email address" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@company.com" />
          <Input id="login-password" label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" />
          <Button className="button--full" type="submit" disabled={loading}>{loading ? <Spinner label="Logging in" /> : <>Log in <ArrowRight size={18} /></>}</Button>
          <p className="auth-switch">New to CrumbCycle? <Link to="/signup">Create an account</Link></p>
        </form>
      </section>
    </main>
  );
}
