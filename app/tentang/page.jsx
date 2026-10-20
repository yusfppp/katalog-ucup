import Button from "@/components/Button";
import { ambilPengaturan } from "@/lib/toko";
import { urlInstagram, urlWhatsApp } from "@/lib/format";

export const metadata = {
  title: "Tentang & Kontak",
  description: "Profil toko, alamat, jam buka, dan kontak WhatsApp.",
};

export default async function HalamanTentang() {
  const toko = await ambilPengaturan();
  const nomorWA = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const instagram = urlInstagram(toko.instagram);
  const pesan = `Halo ${toko.nama}! Saya ingin bertanya tentang toko dan produk.`;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-10 sm:px-6 md:py-16">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-5xl shadow-inner">
          🍩
        </span>
        <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          Tentang Kami
        </span>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="max-w-2xl text-base text-text-muted sm:text-lg">{toko.tagline}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section className="flex flex-col gap-4 rounded-[24px] border-[1.5px] border-border bg-surface p-6 shadow-warm sm:p-8">
          <h2 className="font-heading text-2xl font-bold text-secondary">Cerita singkat</h2>
          <p className="text-sm leading-relaxed text-text sm:text-base">
            {toko.nama} adalah usaha rumahan yang menyiapkan camilan dalam batch kecil agar
            kualitas dan kesegarannya terjaga. Kami percaya camilan sederhana bisa membuat momen
            berkumpul terasa lebih hangat.
          </p>
          <p className="text-sm leading-relaxed text-text sm:text-base">
            Semua pesanan dikonfirmasi lewat WhatsApp sebelum diproses. Kamu bisa menanyakan stok,
            bahan, varian, dan jadwal pengambilan atau pengiriman langsung kepada admin.
          </p>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <div className="rounded-xl bg-primary-soft/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Alamat</p>
              <p className="mt-1 text-sm text-text">{toko.alamat}</p>
            </div>
            <div className="rounded-xl bg-primary-soft/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Jam Buka</p>
              <p className="mt-1 text-sm text-text">{toko.jamBuka}</p>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-3 rounded-[24px] border-[1.5px] border-border bg-surface p-6 shadow-warm">
          <h2 className="font-heading text-2xl font-bold text-secondary">Hubungi Kami</h2>
          <p className="text-sm text-text-muted">
            Cara paling cepat adalah lewat WhatsApp. Admin akan membalas saat jam operasional.
          </p>
          <div className="rounded-xl border border-border/60 bg-bg/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              WhatsApp
            </p>
            <p className="font-heading text-xl font-bold text-secondary">{nomorWA}</p>
          </div>
          {toko.instagram && (
            <div className="rounded-xl border border-border/60 bg-bg/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Instagram
              </p>
              <p className="font-heading text-xl font-bold text-secondary">@{toko.instagram.replace(/^@/, "")}</p>
            </div>
          )}

          <Button
            href={urlWhatsApp(nomorWA, pesan)}
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<span>💬</span>}
          >
            Chat WhatsApp
          </Button>
          {instagram && (
            <Button href={instagram} variant="secondary" size="md" fullWidth>
              Buka Instagram
            </Button>
          )}
          <Button href="/#katalog" variant="tertiary" size="md" fullWidth>
            Lihat Katalog Produk
          </Button>
        </aside>
      </div>

      <section className="rounded-[24px] border-[1.5px] border-border bg-surface p-6 shadow-warm sm:p-8">
        <h2 className="font-heading text-2xl font-bold text-secondary">Cara memesan</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { nomor: "1", judul: "Pilih produk", teks: "Buka katalog dan pilih varian yang diinginkan." },
            { nomor: "2", judul: "Isi keranjang", teks: "Atur jumlah, lalu periksa total belanja." },
            { nomor: "3", judul: "Kirim WhatsApp", teks: "Semua item dikirim dalam satu pesan otomatis." },
            { nomor: "4", judul: "Konfirmasi admin", teks: "Admin mengonfirmasi stok, total, dan pengiriman." },
          ].map((langkah) => (
            <div key={langkah.nomor} className="flex flex-col gap-2 rounded-xl bg-primary-soft/40 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-on-primary">
                {langkah.nomor}
              </span>
              <p className="font-heading text-lg font-bold text-secondary">{langkah.judul}</p>
              <p className="text-sm text-text-muted">{langkah.teks}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
