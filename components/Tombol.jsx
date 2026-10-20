import Button from "./Button";

/**
 * Komponen Tombol (Wrapper kompatibilitas ke Button terpusat)
 * Memastikan semua file yang mengimpor Tombol memakai implementasi Button yang sama.
 */
export default function Tombol({
  varian = "utama",
  variant,
  children,
  ...props
}) {
  const varianMapping = {
    utama: "primary",
    garis: "secondary",
    bahaya: "danger",
    tertiary: "tertiary",
    contrast: "contrast",
  };

  const finalVariant = variant || varianMapping[varian] || "primary";

  return (
    <Button variant={finalVariant} {...props}>
      {children}
    </Button>
  );
}
