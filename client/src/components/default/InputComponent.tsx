import type { InputHTMLAttributes } from 'react';

type InputComponentProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: string;
};

function InputComponent({ id, label, error, className = '', ...inputProps }: InputComponentProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`default-input ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      {error && <span id={errorId} role="alert">{error}</span>}
    </div>
  );
}

export default InputComponent;
