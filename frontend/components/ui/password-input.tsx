"use client";

import { useState, useId } from "react";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function PasswordInput({
  label,
  error,
  hint,
  containerClassName = "",
  className = "",
  id,
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? `password-${generatedId.replace(/:/g, "")}`;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={visible ? "off" : "current-password"}
          className={`input w-full pl-3 pr-10 py-2 text-sm outline-none transition-colors ${className}`}
          {...inputProps}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md focus:outline-none focus:ring-2 transition-colors"
          style={{ color: "var(--foreground-muted)" }}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-xs" style={{ color: "var(--foreground-muted)" }}>{hint}</p>}
      {error && <p className="mt-1 text-sm" style={{ color: "var(--error)" }}>{error}</p>}
    </div>
  );
}
