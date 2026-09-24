/**
 * Labelled form control with an optional hint and error message, wired up for screen readers.
 *
 * @param {string} id         id of the control (also used for the hint/error ids)
 * @param {string} label      visible label text
 * @param {string} [error]    validation message; marks the control aria-invalid
 * @param {string} [hint]     helper text under the label
 * @param {string} [as]       'input' (default), 'select' or 'textarea'
 * Any other props (value, onChange, type, …) are passed to the control.
 */
export default function FormField({ id, label, error, hint, as: Control = 'input', className = '', children, ...controlProps }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="form-hint">
          {hint}
        </p>
      )}
      <Control
        id={id}
        className="form-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...controlProps}
      >
        {children}
      </Control>
      {error && (
        <p id={`${id}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
