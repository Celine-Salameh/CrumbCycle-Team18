import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import BrandLogo from "../components/brand/BrandLogo";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

export default function SignupPage() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      showToast("Your CrumbCycle workspace is ready.");
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel auth-brand-panel--signup">
        <BrandLogo light />
        <div><span className="eyebrow eyebrow--light">Start the cycle</span><h1>Make every surplus decision count.</h1><p>Connect forecasting, recovery actions, and community impact in one place.</p></div>
        <small>No admin access is requested during public registration.</small>
      </section>
      <section className="auth-form-panel">
        <Link className="back-link" to="/"><ArrowLeft size={17} /> Back to home</Link>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div><span className="eyebrow">Create your workspace</span><h2>Join CrumbCycle</h2><p>Start with your account details. You can add your organization later.</p></div>
          {error && <div className="form-alert" role="alert">{error}</div>}
          <Input id="signup-name" label="Full name" autoComplete="name" minLength="2" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" />
          <Input id="signup-email" label="Email address" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@company.com" />
          <Input id="signup-password" label="Password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" />
          <Button className="button--full" type="submit" disabled={loading}>{loading ? <Spinner label="Creating account" /> : <>Create account <ArrowRight size={18} /></>}</Button>
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
        </form>
      </section>
    </main>
  );
}
