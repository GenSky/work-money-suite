export function InputField({ id, label, hint, error, ...props }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <input
        id={id}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint ? (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function SelectField({ id, label, hint, children, ...props }) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <select id={id} aria-describedby={hintId} {...props}>
        {children}
      </select>
      {hint ? (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}
