"use client";

import { useState, useRef } from "react";

/**
 * Komponen Input / Field Terpusat Alfa Bites
 * Mendukung seluruh tipe form dengan styling hangat & ramah WCAG AA.
 */
export default function Input({
  label,
  name,
  type = "text", // text, email, tel, password, number, search, textarea, select, checkbox, radio, switch, date, time, stepper, file
  helperText,
  error,
  success,
  required = false,
  disabled = false,
  placeholder,
  value,
  defaultValue,
  onChange,
  options = [], // [{ label, value }] untuk select atau radio
  min,
  max,
  step = 1,
  rows = 4,
  maxLength,
  accept,
  className = "",
  textarea = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? "");
  const [stepperValue, setStepperValue] = useState(Number(defaultValue ?? value ?? min ?? 1));
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  // Normalisasi type bila textarea=true
  const actualType = textarea ? "textarea" : type;

  // Handler search clear
  const handleClearSearch = () => {
    setInternalValue("");
    if (onChange) {
      onChange({ target: { name, value: "" } });
    }
  };

  // Handler stepper
  const handleStep = (delta) => {
    const minVal = min !== undefined ? Number(min) : 1;
    const maxVal = max !== undefined ? Number(max) : 999;
    const nextVal = Math.max(minVal, Math.min(maxVal, stepperValue + delta * Number(step)));
    setStepperValue(nextVal);
    if (onChange) {
      onChange({ target: { name, value: nextVal } });
    }
  };

  // Base input class
  const baseInputClass = `w-full bg-surface text-text rounded-xl border-[1.5px] transition-all duration-200 placeholder:text-text-muted focus:outline-none ${
    error
      ? "border-error focus:border-error focus:ring-4 focus:ring-error/15"
      : success
      ? "border-success focus:border-success focus:ring-4 focus:ring-success/15"
      : "border-border focus:border-primary focus:ring-4 focus:ring-primary-soft"
  } ${disabled ? "opacity-60 cursor-not-allowed bg-bg/50" : ""}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Label Selalu di Atas (Kecuali Checkbox, Radio, Switch) */}
      {label && !["checkbox", "radio", "switch"].includes(actualType) && (
        <label htmlFor={name} className="flex items-center gap-1 text-sm font-bold text-secondary">
          <span>{label}</span>
          {required && <span className="text-error font-bold" aria-hidden="true">*</span>}
        </label>
      )}

      {/* RENDER SESUAI TIPE */}

      {/* 1. TEXTAREA */}
      {actualType === "textarea" && (
        <div className="relative">
          <textarea
            id={name}
            name={name}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
              if (onChange) onChange(e);
            }}
            className={`${baseInputClass} p-3.5 leading-relaxed resize-y`}
            {...props}
          />
          {maxLength && (
            <div className="mt-1 text-right text-xs text-text-muted">
              {String(internalValue || "").length} / {maxLength}
            </div>
          )}
        </div>
      )}

      {/* 2. PASSWORD */}
      {actualType === "password" && (
        <div className="relative flex items-center">
          <input
            id={name}
            name={name}
            type={showPassword ? "text" : "password"}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            className={`${baseInputClass} h-12 pl-4 pr-12`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            className="absolute right-3 p-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer rounded-lg"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* 3. SEARCH */}
      {actualType === "search" && (
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-text-muted pointer-events-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            id={name}
            name={name}
            type="text"
            disabled={disabled}
            placeholder={placeholder || "Cari donat favoritmu..."}
            value={value !== undefined ? value : internalValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
              if (onChange) onChange(e);
            }}
            className={`${baseInputClass} h-12 pl-11 pr-11`}
            {...props}
          />
          {(value || internalValue) && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Hapus pencarian"
              className="absolute right-3 p-1.5 text-text-muted hover:text-error transition-colors cursor-pointer rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 4. SELECT / DROPDOWN */}
      {actualType === "select" && (
        <div className="relative flex items-center">
          <select
            id={name}
            name={name}
            disabled={disabled}
            defaultValue={defaultValue}
            value={value}
            onChange={onChange}
            className={`${baseInputClass} h-12 px-4 pr-10 appearance-none cursor-pointer`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3.5 pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      )}

      {/* 5. CHECKBOX */}
      {actualType === "checkbox" && (
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <input
            id={name}
            name={name}
            type="checkbox"
            disabled={disabled}
            defaultChecked={props.defaultChecked}
            checked={props.checked}
            onChange={onChange}
            className="w-5 h-5 rounded-md border-[1.5px] border-border text-primary focus:ring-3 focus:ring-primary-soft accent-primary cursor-pointer"
            {...props}
          />
          <span className="text-sm font-semibold text-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      {/* 6. RADIO GROUP */}
      {actualType === "radio" && (
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label key={opt.value} className="inline-flex items-center gap-3 cursor-pointer select-none">
              <input
                type="radio"
                name={name}
                value={opt.value}
                disabled={disabled}
                defaultChecked={opt.value === defaultValue}
                onChange={onChange}
                className="w-4 h-4 border-[1.5px] border-border text-primary focus:ring-3 focus:ring-primary-soft accent-primary cursor-pointer"
                {...props}
              />
              <span className="text-sm font-semibold text-text">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* 7. SWITCH / TOGGLE */}
      {actualType === "switch" && (
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              id={name}
              name={name}
              type="checkbox"
              disabled={disabled}
              defaultChecked={props.defaultChecked}
              checked={props.checked}
              onChange={onChange}
              className="sr-only peer"
              {...props}
            />
            <div className="w-11 h-6 bg-border peer-focus:ring-3 peer-focus:ring-primary-soft rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
          <span className="text-sm font-semibold text-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      {/* 8. QUANTITY STEPPER */}
      {actualType === "stepper" && (
        <div className="inline-flex items-center rounded-xl border-[1.5px] border-border bg-surface overflow-hidden shadow-sm h-12 w-fit">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={disabled || stepperValue <= (min !== undefined ? Number(min) : 1)}
            aria-label="Kurangi jumlah"
            className="w-12 h-full flex items-center justify-center text-secondary hover:bg-primary-soft hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg cursor-pointer"
          >
            −
          </button>
          <input
            id={name}
            name={name}
            type="number"
            readOnly
            value={stepperValue}
            className="w-14 text-center font-heading font-bold text-lg text-secondary border-x border-border focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={disabled || stepperValue >= (max !== undefined ? Number(max) : 999)}
            aria-label="Tambah jumlah"
            className="w-12 h-full flex items-center justify-center text-secondary hover:bg-primary-soft hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg cursor-pointer"
          >
            +
          </button>
        </div>
      )}

      {/* 9. FILE / IMAGE UPLOAD */}
      {actualType === "file" && (
        <div className="relative">
          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files?.[0]) setFileName(e.target.files[0].name);
              if (onChange) onChange(e);
            }}
            className="sr-only"
            ref={inputRef}
            {...props}
          />
          <div
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-primary-soft/30 transition-all ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex flex-col items-center gap-1.5 text-text-muted">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-secondary">
                {fileName ? fileName : "Klik atau seret foto donat ke sini"}
              </p>
              <p className="text-xs text-text-muted">PNG, JPG, WEBP hingga 5MB</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. STANDARD INPUTS: TEXT, EMAIL, TEL, NUMBER, DATE, TIME */}
      {!["textarea", "password", "search", "select", "checkbox", "radio", "switch", "stepper", "file"].includes(actualType) && (
        <input
          id={name}
          name={name}
          type={actualType}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={`${baseInputClass} h-12 px-4`}
          {...props}
        />
      )}

      {/* HELPER TEXT ATAU PESAN ERROR / SUKSES */}
      {error && (
        <p className="flex items-center gap-1 text-xs font-semibold text-error mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}

      {!error && success && (
        <p className="flex items-center gap-1 text-xs font-semibold text-success mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </p>
      )}

      {!error && !success && helperText && (
        <p className="text-xs text-text-muted mt-0.5">{helperText}</p>
      )}
    </div>
  );
}

export const Field = Input;
