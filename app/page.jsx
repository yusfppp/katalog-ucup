import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconClock,
  IconCookie,
  IconMapPin,
  IconSearch,
  IconShoppingCart,
  IconSpeakerphone,
} from "@tabler/icons-react";
import KartuProduk from "@/components/KartuProduk";
import BintangRating from "@/components/BintangRating";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Pagination from "@/components/Pagination";
import FaqSection from "@/components/FaqSection";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import { ambilPengaturan } from "@/lib/toko";
import {
  ambilBannerAktif,
  ambilKategoriPublik,
  ambilProdukPublik,
  ambilUlasanTerbaru,
  PRODUK_PER_HALAMAN,
} from "@/lib/produk";
import { urlWhatsApp } from "@/lib/format";

export const dynamic = "force-dynamic";

const URUTAN = [
  { label: "Pilihan toko", value: "pilihan" },
  { label: "Terbaru", value: "terbaru" },
  { label: "Termurah", value: "termurah" },
  { label: "Termahal", value: "termahal" },
];

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const kataKunci = typeof params?.q === "string" ? params.q.trim().slice(0, 100) : "";
  const kategoriSlug = typeof params?.kategori === "string" ? params.kategori.trim() : "";
  const urut = URUTAN.some((item) => item.value === params?.urut) ? params.urut : "pilihan";
  const halaman = Math.max(1, Number.parseInt(params?.hal, 10) || 1);

  const [produkRes, kategoriRes, bannerRes, ulasanRes, toko] = await Promise.all([
    ambilProdukPublik({
      q: kataKunci,
      kategoriSlug,
      urut,
      hal: halaman,
      perHalaman: PRODUK_PER_HALAMAN,
    }),
    ambilKategoriPublik(),
    ambilBannerAktif(),
    ambilUlasanTerbaru(3),
    ambilPengaturan(),
  ]);

  const daftarProduk = produkRes.data || [];
  const daftarKategori = kategoriRes.data || [];
  const banner = (bannerRes.data || []).slice(0, 3);
  const ulasan = (ulasanRes.data || []).filter((item) => item.tampil !== false);
  const nomorWA = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const kategoriAktif = daftarKategori.find((item) => item.slug === kategoriSlug) || null;
  const sedangDifilter = Boolean(kataKunci || kategoriSlug);
  const totalHalaman = Math.max(1, Math.ceil((produkRes.count || 0) / PRODUK_PER_HALAMAN));

  return (
    <div className="flex flex-col gap-20 pb-16 sm:gap-24">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary-soft/40 via-bg to-bg pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 text-center lg:col-span-7 lg:text-left">
            <span className="inline-flex items-center gap-2 self-center rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 shadow-sm lg:self-start">
              <IconCookie size={17} stroke={1.9} aria-hidden="true" className="text-primary" />
              <span className="text-xs font-bold tracking-wide text-primary sm:text-sm">
                {toko.jamBuka}
              </span>
            </span>

            <h1 className="font-heading text-4xl font-bold leading-[1.15] tracking-tight text-secondary sm:text-5xl lg:text-6xl">
              {toko.tagline}
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-text sm:text-lg lg:mx-0">
              Katalog camilan rumahan {toko.nama}. Pilih produk dan varian favoritmu, masukkan ke
              keranjang, lalu pesan semuanya dalam satu pesan WhatsApp.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
              <Button
                href="#katalog"
                variant="primary"
                size="lg"
                rightIcon={<IconArrowRight size={20} stroke={2} aria-hidden="true" />}
              >
                Lihat Katalog
              </Button>
              <Button
                href={urlWhatsApp(
                  nomorWA,
                  `Halo ${toko.nama}! Saya ingin bertanya tentang produk yang tersedia.`
                )}
                variant="secondary"
                size="lg"
                leftIcon={<IconBrandWhatsapp size={20} stroke={1.9} aria-hidden="true" />}
              >
                Tanya Admin
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs font-semibold text-text-muted lg:justify-start">
              <span className="flex items-center gap-1.5">
                <BintangRating nilai={5} size={14} /> Ulasan dari pembeli
              </span>
              <span aria-hidden="true">•</span>
              <span>Pesan langsung via WhatsApp</span>
              <span aria-hidden="true">•</span>
              <span>{toko.alamat.split(",")[0]}</span>
            </div>
          </div>

          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative flex aspect-square w-full max-w-md items-center justify-center">
              <div className="absolute inset-0 -z-10 rounded-full bg-primary-soft/60" />
              <div className="absolute inset-4 -z-10 rounded-full border-2 border-dashed border-accent/40" />
              <div className="relative flex w-4/5 flex-col items-center justify-center gap-2 overflow-hidden rounded-[24px] border-2 border-border bg-surface p-6 text-center shadow-warm-lg">
                <IconCookie size={84} stroke={1.4} aria-hidden="true" className="text-primary" />
                <h2 className="font-heading text-xl font-bold text-secondary">Fresh Setiap Hari</h2>
                <p className="text-xs text-text-muted">
                  Dibuat sesuai pesanan agar tekstur dan rasanya tetap nikmat.
                </p>
                <span className="mt-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-secondary">
                  Homemade & Higienis
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {banner.length > 0 && (
        <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6" aria-label="Promo toko">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {banner.map((item) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-[20px] border-[1.5px] border-primary/30 bg-surface shadow-warm"
              >
                {item.gambar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.gambar_url}
                    alt=""
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center bg-primary-soft text-primary">
                    <IconSpeakerphone size={34} stroke={1.7} aria-hidden="true" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Promo
                  </span>
                  <h2 className="font-heading text-xl font-bold text-secondary">{item.judul}</h2>
                  <p className="text-sm text-text-muted">{item.teks}</p>
                  <div className="mt-auto pt-3">
                    <Button
                      href={item.tautan || "/#katalog"}
                      variant="primary"
                      size="sm"
                      fullWidth
                    >
                      Lihat Promo
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section id="katalog" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/60 pb-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Katalog Produk
            </span>
            <h2 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
              {kategoriAktif ? kategoriAktif.nama : "Pilihan untuk Kamu"}
            </h2>
            <p className="text-sm text-text-muted sm:text-base">
              {kategoriAktif
                ? `Semua produk dalam kategori ${kategoriAktif.nama}.`
                : "Cari produk, saring kategori, dan urutkan sesuai kebutuhanmu."}
            </p>
          </div>
          {kategoriAktif && (
            <Button
              href={`/kategori/${kategoriAktif.slug}`}
              variant="secondary"
              size="md"
            >
              Halaman kategori
            </Button>
          )}
          <Button
            href="/keranjang"
            variant="secondary"
            size="md"
            leftIcon={<IconShoppingCart size={19} stroke={1.9} aria-hidden="true" />}
          >
            Buka Keranjang
          </Button>
        </div>

        <div className="mb-8 flex flex-col gap-5">
          <form action="/#katalog" method="get" className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-end">
            <Input
              label="Cari produk"
              name="q"
              type="search"
              defaultValue={kataKunci}
              maxLength={100}
              placeholder="Contoh: nastar, keripik..."
            />
            <Input
              label="Kategori"
              name="kategori"
              type="select"
              defaultValue={kategoriSlug}
              options={[
                { label: "Semua kategori", value: "" },
                ...daftarKategori.map((item) => ({ label: item.nama, value: item.slug })),
              ]}
            />
            <Input
              label="Urutkan"
              name="urut"
              type="select"
              defaultValue={urut}
              options={URUTAN}
            />
            <Button type="submit" variant="primary" className="md:mb-0">
              Terapkan
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2" aria-label="Filter kategori cepat">
            <span className="mr-1 text-sm font-bold text-secondary">Kategori:</span>
            <Button
              href="/#katalog"
              variant={!kategoriSlug ? "primary" : "secondary"}
              size="sm"
              aria-current={!kategoriSlug ? "page" : undefined}
            >
              Semua
            </Button>
            {daftarKategori.map((kategori) => (
              <Button
                key={kategori.slug}
                href={`/?kategori=${encodeURIComponent(kategori.slug)}#katalog`}
                variant={kategoriSlug === kategori.slug ? "primary" : "secondary"}
                size="sm"
                aria-current={kategoriSlug === kategori.slug ? "page" : undefined}
              >
                {kategori.nama}
              </Button>
            ))}
          </div>
        </div>

        {produkRes.error ? (
          <div className="rounded-[20px] border-[1.5px] border-error/30 bg-surface p-8 text-center shadow-warm">
            <p className="font-heading text-xl font-bold text-error">Gagal memuat produk</p>
            <p className="mt-2 text-sm text-text-muted">{produkRes.error}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-border bg-surface p-8 text-center shadow-warm sm:p-12">
            <IconSearch size={52} stroke={1.5} aria-hidden="true" className="text-primary/70" />
            <p className="font-heading text-2xl font-bold text-secondary">
              {sedangDifilter ? "Produk tidak ditemukan" : "Belum ada produk"}
            </p>
            <p className="text-sm text-text-muted">
              {sedangDifilter
                ? "Coba kata pencarian atau kategori lain."
                : "Admin belum menambahkan produk. Silakan cek lagi nanti."}
            </p>
            {sedangDifilter && (
              <Button href="/#katalog" variant="primary" className="mt-2">
                Reset filter
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-text-muted">
              Menampilkan {daftarProduk.length} dari {produkRes.count || 0} produk
              {kataKunci ? ` untuk “${kataKunci}”` : ""}.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>
          </>
        )}

        <div className="mt-10">
          <Pagination
            basePath="/"
            halaman={Math.min(halaman, totalHalaman)}
            total={produkRes.count || 0}
            perHalaman={PRODUK_PER_HALAMAN}
            params={{ q: kataKunci, kategori: kategoriSlug, urut: urut === "pilihan" ? "" : urut }}
            anchor="#katalog"
            label="produk"
          />
        </div>
      </section>

      <TerakhirDilihat />

      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-6 rounded-[24px] border-[1.5px] border-border bg-surface p-7 shadow-warm sm:p-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Kenali Kami
            </span>
            <h2 className="font-heading text-3xl font-bold text-secondary">
              Camilan rumahan dari {toko.nama}
            </h2>
            <p className="text-sm leading-relaxed text-text-muted">
              Kami membuat camilan dalam batch kecil agar kualitasnya terjaga. Semua pesanan
              dikonfirmasi lewat WhatsApp sebelum diproses.
            </p>
            <div className="space-y-2 pt-2 text-sm">
              <p className="flex items-start gap-2">
                <IconMapPin
                  size={18}
                  stroke={1.9}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-accent"
                />
                <span>{toko.alamat}</span>
              </p>
              <p className="flex items-center gap-2">
                <IconClock
                  size={18}
                  stroke={1.9}
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                />
                <span>{toko.jamBuka}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-[20px] bg-primary-soft/60 p-6">
            <p className="font-heading text-xl font-bold text-secondary">Butuh bantuan memilih?</p>
            <p className="text-sm text-text-muted">
              Hubungi admin untuk menanyakan stok, bahan, atau rekomendasi paket.
            </p>
            <Button
              href={urlWhatsApp(nomorWA, `Halo ${toko.nama}! Saya ingin bertanya tentang produk.`)}
              variant="primary"
              size="md"
              leftIcon={<IconBrandWhatsapp size={19} stroke={1.9} aria-hidden="true" />}
            >
              Chat Admin
            </Button>
            <Button href="/tentang" variant="secondary" size="md">
              Tentang Toko
            </Button>
          </div>
        </div>
      </section>

      {ulasan.length > 0 && (
        <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Ulasan Pembeli
            </span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-secondary sm:text-4xl">
              Apa Kata Mereka?
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Ulasan asli yang ditampilkan setelah moderasi admin.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ulasan.map((item) => {
              const produkUlasan = Array.isArray(item.produk) ? item.produk[0] : item.produk;
              return (
                <article
                  key={item.id}
                  className="flex flex-col rounded-[20px] border-[1.5px] border-border bg-surface p-6 shadow-warm"
                >
                  <BintangRating nilai={item.rating} size={17} />
                  <p className="mt-3 flex-1 text-sm italic leading-relaxed text-text">
                    &ldquo;{item.komentar}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
                    <div>
                      <p className="font-heading text-sm font-bold text-secondary">{item.nama}</p>
                      <p className="text-[11px] text-text-muted">
                        {produkUlasan?.nama || "Produk"}
                      </p>
                    </div>
                    {produkUlasan?.id && (
                      <Button href={`/produk/${produkUlasan.id}`} variant="tertiary" size="sm">
                        Lihat
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section id="faq" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-xl space-y-2 text-center">
          <span className="rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
            Tanya Jawab
          </span>
          <h2 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
            Pertanyaan Sering Diajukan
          </h2>
        </div>
        <FaqSection />
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[24px] bg-primary px-6 py-14 text-center text-on-primary shadow-warm-lg sm:px-12 sm:py-16">
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
            <IconCookie size={48} stroke={1.5} aria-hidden="true" className="text-on-primary/90" />
            <h2 className="font-heading text-3xl font-bold leading-tight text-on-primary sm:text-4xl">
              Siap memesan camilan favoritmu?
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-on-primary/90 sm:text-base">
              Isi keranjang, lalu kirim semua pesanan dalam satu pesan WhatsApp. Admin akan
              mengonfirmasi ketersediaan dan total harga.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button href="/#katalog" variant="contrast" size="lg">
                Pilih Produk
              </Button>
              <Button
                href="/keranjang"
                variant="secondary"
                size="lg"
                leftIcon={<IconShoppingCart size={20} stroke={1.9} aria-hidden="true" />}
              >
                Lihat Keranjang
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
