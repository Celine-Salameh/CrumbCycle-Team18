export default function Input({ label, error, id, className = "", ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      <span className="field__label">{label}</span>
      <input id={id} className={`field__input ${error ? "field__input--error" : ""}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <span className="field__error" id={`${id}-error`}>{error}</span>}
    </label>
  );
}
