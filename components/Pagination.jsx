import Button from "@/components/Button";

function daftarNomor(halaman, totalHalaman) {
  const nomor = new Set([1, totalHalaman]);
  for (let i = halaman - 1; i <= halaman + 1; i += 1) {
    if (i >= 1 && i <= totalHalaman) nomor.add(i);
  }
  const urut = [...nomor].sort((a, b) => a - b);
  const hasil = [];
  for (let i = 0; i < urut.length; i += 1) {
    if (i > 0 && urut[i] - urut[i - 1] > 1) hasil.push("...");
    hasil.push(urut[i]);
  }
  return hasil;
}

export default function Pagination({
  basePath,
  halaman = 1,
  total = 0,
  perHalaman = 12,
  params = {},
  anchor = "",
  label = "produk",
}) {
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  const sekarang = Math.min(Math.max(1, halaman), totalHalaman);

  const buatHref = (tujuan) => {
    const query = new URLSearchParams();
    for (const [kunci, nilai] of Object.entries(params)) {
      if (nilai !== undefined && nilai !== null && String(nilai).trim() !== "") {
        query.set(kunci, String(nilai));
      }
    }
    if (tujuan > 1) query.set("hal", String(tujuan));
    else query.delete("hal");
    const qs = query.toString();
    return `${basePath}${qs ? `?${qs}` : ""}${anchor}`;
  };

  if (totalHalaman <= 1) {
    return (
      <p className="text-center text-sm text-text-muted" role="status">
        Menampilkan {total} {label}.
      </p>
    );
  }

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-col items-center gap-3">
      <p className="text-sm text-text-muted" role="status">
        Halaman {sekarang} dari {totalHalaman} • {total} {label}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {sekarang > 1 ? (
          <Button href={buatHref(sekarang - 1)} variant="secondary" size="sm">
            ← Sebelumnya
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled aria-label="Halaman sebelumnya tidak tersedia">
            ← Sebelumnya
          </Button>
        )}

        {daftarNomor(sekarang, totalHalaman).map((nomor, indeks) =>
          nomor === "..." ? (
            <span key={`ellipsis-${indeks}`} className="px-1 text-text-muted" aria-hidden="true">
              …
            </span>
          ) : (
            <Button
              key={nomor}
              href={buatHref(nomor)}
              variant={nomor === sekarang ? "primary" : "tertiary"}
              size="sm"
              aria-current={nomor === sekarang ? "page" : undefined}
              aria-label={`Halaman ${nomor}`}
            >
              {nomor}
            </Button>
          )
        )}

        {sekarang < totalHalaman ? (
          <Button href={buatHref(sekarang + 1)} variant="secondary" size="sm">
            Berikutnya →
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled aria-label="Halaman berikutnya tidak tersedia">
            Berikutnya →
          </Button>
        )}
      </div>
    </nav>
  );
}
