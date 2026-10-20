import Link from "next/link";

/**
 * Komponen Button Terpusat Alfa Bites
 * Satu komponen untuk semua jenis button di seluruh website.
 */
export default function Button({
  children,
  variant = "primary", // "primary" | "secondary" | "tertiary" | "contrast" | "danger" | "tertiary-light"
  size = "md", // "sm" | "md" | "lg"
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  iconOnly = false,
  href,
  className = "",
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  target,
  rel,
  ...props
}) {
  // Base styling: pill (999px), font-bold, transitions, touch target >= 44px
  const baseClasses =
    "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 cursor-pointer select-none outline-none min-h-[44px] active:scale-[0.98] focus-visible:ring-3 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

  // Size styling
  const sizeClasses = {
    sm: iconOnly ? "w-9 h-9 min-w-[44px] min-h-[44px] p-2 text-sm" : "h-9 px-4 text-sm gap-1.5",
    md: iconOnly ? "w-11 h-11 min-w-[44px] min-h-[44px] p-2.5 text-base" : "h-11 px-5 text-base gap-2",
    lg: iconOnly ? "w-[52px] h-[52px] min-w-[52px] min-h-[52px] p-3 text-lg" : "h-[52px] px-7 text-lg gap-2.5",
  }[size] || "h-11 px-5 text-base gap-2";

  // Variant styling
  const variantClasses = {
    primary:
      "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active shadow-md hover:shadow-lg hover:-translate-y-0.5",
    secondary:
      "bg-primary-soft text-primary border-[1.5px] border-primary hover:bg-primary hover:text-on-primary active:bg-primary-hover shadow-sm",
    tertiary:
      "bg-transparent text-secondary hover:bg-primary-soft hover:text-primary active:bg-primary-soft/80 border border-transparent",
    contrast:
      "bg-surface text-primary hover:bg-primary-soft active:bg-primary-soft/80 shadow-md hover:shadow-lg hover:-translate-y-0.5",
    danger:
      "bg-error text-on-error hover:opacity-90 active:opacity-100 shadow-sm",
    "tertiary-light":
      "bg-transparent text-on-footer hover:bg-on-footer/10 hover:text-accent border border-transparent",
  }[variant] || "bg-primary text-on-primary";

  // Disabled and loading styling
  const stateClasses = (disabled || loading)
    ? "opacity-50 cursor-not-allowed pointer-events-none active:scale-100 shadow-none hover:translate-y-0"
    : "";

  const widthClass = fullWidth ? "w-full" : "";

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${stateClasses} ${widthClass} ${className}`.trim();

  // Content with optional icons and loading spinner
  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </>
  );

  // If href is present, render as Link or anchor
  if (href && !disabled) {
    const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:") || href.startsWith("mailto:");

    if (isExternal) {
      return (
        <a
          href={href}
          className={combinedClasses}
          target={target || "_blank"}
          rel={rel || "noopener noreferrer"}
          aria-label={ariaLabel}
          onClick={onClick}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={combinedClasses}
        aria-label={ariaLabel}
        onClick={onClick}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Otherwise render semantically as button
  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {content}
    </button>
  );
}

