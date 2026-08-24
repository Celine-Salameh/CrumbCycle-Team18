import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import BrandLogo from "../components/brand/BrandLogo";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

const countries = [
  "Australia",
  "Brazil",
  "Canada",
  "France",
  "Germany",
  "India",
  "Italy",
  "Japan",
  "Lebanon",
  "Mexico",
  "Saudi Arabia",
  "Spain",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
];

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const phonePattern = /^\+?[0-9\s().-]{7,20}$/;

const passwordRequirements = [
  { key: "length", label: "Minimum 8 characters", test: (password) => password.length >= 8, error: "Needs at least 8 characters" },
  { key: "uppercase", label: "Uppercase letter", test: (password) => /[A-Z]/.test(password), error: "Needs uppercase letter" },
  { key: "lowercase", label: "Lowercase letter", test: (password) => /[a-z]/.test(password), error: "Needs lowercase letter" },
  { key: "number", label: "Number", test: (password) => /[0-9]/.test(password), error: "Needs number" },
  { key: "symbol", label: "Symbol", test: (password) => /[^A-Za-z0-9]/.test(password), error: "Needs symbol" },
];

function getPasswordStatus(password) {
  return passwordRequirements.map((requirement) => ({ ...requirement, met: requirement.test(password) }));
}

function getPasswordStrength(password) {
  const metCount = getPasswordStatus(password).filter((requirement) => requirement.met).length;
  if (!password) return 0;
  if (metCount <= 1) return 1;
  if (metCount <= 3) return 2;
  if (metCount === 4) return 3;
  return 4;
}

function requiredLabel(label) {
  return <>{label}<span className="field__required" aria-hidden="true">*</span></>;
}

function getValidationErrors(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = "Full name must be at least 2 characters.";
  if (!form.email.trim()) errors.email = "Email address is required.";
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address.";
  const missingPasswordCriteria = getPasswordStatus(form.password).filter((requirement) => !requirement.met).map((requirement) => requirement.error);
  if (missingPasswordCriteria.length) errors.password = missingPasswordCriteria.join(". ");
  if (!form.role.trim()) errors.role = "Role or job title is required.";
  if (form.phone.trim() && !phonePattern.test(form.phone.trim())) errors.phone = "Enter a valid phone number.";
  if (!form.country) errors.country = "Country or region is required.";
  if (!form.workspaceName.trim()) errors.workspaceName = "Preferred workspace name is required.";
  if (!form.termsAccepted) errors.termsAccepted = "You must accept the terms and privacy policy.";
  return errors;
}


function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function SignupPage() {
  const { signup, googleSignup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    organization: "",
    phone: "",
    country: "",
    workspaceName: "",
    termsAccepted: false,
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validationErrors = useMemo(() => getValidationErrors(form), [form]);
  const passwordStrength = getPasswordStrength(form.password);
  const passwordStatus = getPasswordStatus(form.password);
  const passwordStrengthLabel = ["", "Weak", "Medium", "Strong", "Very strong"][passwordStrength];
  const isFormValid = Object.keys(validationErrors).length === 0;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;
    let cancelled = false;
    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !googleButtonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setError("");
            setGoogleLoading(true);
            try {
              await googleSignup({ credential: response.credential });
              showToast("Your CrumbCycle workspace is ready.");
              navigate("/dashboard", { replace: true });
            } catch (requestError) {
              setError(requestError.message);
            } finally {
              setGoogleLoading(false);
            }
          },
        });
        googleButtonRef.current.innerHTML = "";
        const googleButtonWidth = Math.min(400, Math.floor(googleButtonRef.current.getBoundingClientRect().width || 400));
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "signup_with",
          logo_alignment: "left",
          width: googleButtonWidth,
        });
      })
      .catch(() => setError("Google sign-up could not load. Please try again."));
    return () => {
      cancelled = true;
    };
  }, [googleSignup, navigate, showToast]);

  function fieldError(name) {
    if (name === "password" && form.password) return validationErrors.password;
    return touched[name] || submitted ? validationErrors[name] : "";
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function markTouched(name) {
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    if (!isFormValid) return;
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
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div><span className="eyebrow">Create your workspace</span><h2>Join CrumbCycle</h2><p>Start with your account details. You can add your organization later.</p></div>
          {error && <div className="form-alert" role="alert">{error}</div>}
          <Input id="signup-name" label={requiredLabel("Full name")} autoComplete="name" minLength="2" required value={form.name} onBlur={() => markTouched("name")} onChange={(event) => updateField("name", event.target.value)} error={fieldError("name")} placeholder="Your full name" />
          <Input id="signup-email" label={requiredLabel("Email address")} type="email" autoComplete="email" required value={form.email} onBlur={() => markTouched("email")} onChange={(event) => updateField("email", event.target.value)} error={fieldError("email")} placeholder="you@company.com" />
          <div className="password-section">
            <Input id="signup-password" label={requiredLabel("Password")} type="password" autoComplete="new-password" minLength="8" maxLength="72" required value={form.password} onBlur={() => markTouched("password")} onChange={(event) => updateField("password", event.target.value)} error="" placeholder="At least 8 characters" />
            <div className="password-strength" aria-live="polite">
              <div className="password-strength__header"><span>Password strength</span><strong>{passwordStrengthLabel || "Not started"}</strong></div>
              <div className="password-strength__track" role="meter" aria-label={`Password strength: ${passwordStrengthLabel || "not started"}`} aria-valuemin="0" aria-valuemax="4" aria-valuenow={passwordStrength}>
                {[1, 2, 3, 4].map((segment) => <span key={segment} className={`password-strength__segment password-strength__segment--${segment} ${passwordStrength >= segment ? "password-strength__segment--active" : ""}`} />)}
              </div>
            </div>
            <ul className="password-checklist" aria-label="Password requirements">
              {passwordStatus.map((requirement) => {
                const Icon = requirement.met ? CheckCircle2 : Circle;
                return <li key={requirement.key} className={requirement.met ? "password-checklist__item password-checklist__item--met" : "password-checklist__item"} aria-label={`${requirement.met ? "Met" : "Missing"}: ${requirement.label}`}><Icon size={16} aria-hidden="true" /> <span>{requirement.label}</span></li>;
              })}
            </ul>
          </div>
          <Input id="signup-role" label={requiredLabel("Role / Job Title")} autoComplete="organization-title" required value={form.role} onBlur={() => markTouched("role")} onChange={(event) => updateField("role", event.target.value)} error={fieldError("role")} placeholder="Operations manager" />
          <Input id="signup-organization" label="Organization Name" autoComplete="organization" value={form.organization} onBlur={() => markTouched("organization")} onChange={(event) => updateField("organization", event.target.value)} error={fieldError("organization")} placeholder="Organization name" />
          <Input id="signup-phone" label="Phone Number" type="tel" autoComplete="tel" value={form.phone} onBlur={() => markTouched("phone")} onChange={(event) => updateField("phone", event.target.value)} error={fieldError("phone")} placeholder="+961 70 123 456" />
          <label className="field" htmlFor="signup-country">
            <span className="field__label">Country / Region<span className="field__required" aria-hidden="true">*</span></span>
            <span className="select-field">
              <select id="signup-country" className={`field__input select-field__input ${fieldError("country") ? "field__input--error" : ""}`} required value={form.country} onBlur={() => markTouched("country")} onChange={(event) => updateField("country", event.target.value)} aria-invalid={Boolean(fieldError("country"))} aria-describedby={fieldError("country") ? "signup-country-error" : undefined}>
                <option value="">Select country or region</option>
                {countries.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </span>
            {fieldError("country") && <span className="field__error" id="signup-country-error">{fieldError("country")}</span>}
          </label>
          <Input id="signup-workspace" label={requiredLabel("Preferred Workspace Name")} required value={form.workspaceName} onBlur={() => markTouched("workspaceName")} onChange={(event) => updateField("workspaceName", event.target.value)} error={fieldError("workspaceName")} placeholder="Green Bistro Hub" />
          <label className="checkbox-field" htmlFor="signup-terms">
            <input id="signup-terms" type="checkbox" checked={form.termsAccepted} onBlur={() => markTouched("termsAccepted")} onChange={(event) => updateField("termsAccepted", event.target.checked)} aria-invalid={Boolean(fieldError("termsAccepted"))} aria-describedby={fieldError("termsAccepted") ? "signup-terms-error" : undefined} />
            <span>I agree to the terms and privacy policy.<span className="field__required" aria-hidden="true">*</span></span>
          </label>
          {fieldError("termsAccepted") && <span className="field__error" id="signup-terms-error">{fieldError("termsAccepted")}</span>}
          <Button className="button--full" type="submit" disabled={loading || !isFormValid}>{loading ? <Spinner label="Creating account" /> : <>Create account <ArrowRight size={18} /></>}</Button>
          <div className="auth-separator"><span>or</span></div>
          {googleClientId ? <div className={`google-signup ${googleLoading ? "google-signup--loading" : ""}`} ref={googleButtonRef} aria-label="Sign up with Google" /> : <button className="google-signup-fallback" type="button" onClick={() => setError("Google sign-up is not configured yet. Add VITE_GOOGLE_CLIENT_ID to frontend/.env and GOOGLE_CLIENT_ID to backend/.env, then restart both servers.")}>Sign up with Google</button>}
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
        </form>
      </section>
    </main>
  );
}
