import KartuProduk from "@/components/KartuProduk";
import Button from "@/components/Button";
import FormPemesanan from "@/components/FormPemesanan";
import FaqSection from "@/components/FaqSection";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog() {
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = `Gagal memuat produk: ${err.message || "Terjadi kesalahan pada server."}`;
  }

  const nomorWA = (toko.nomorWhatsApp || "").replace(/\D/g, "");

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-16">
      {/* 1. HERO SECTION */}
      <section
        id="hero"
        className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/60 bg-gradient-to-b from-primary-soft/30 via-bg to-bg"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* TEXT CONTENT */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full bg-primary-soft border border-primary/20 px-4 py-1.5 shadow-sm">
                <span className="text-base">🍩</span>
                <span className="text-xs sm:text-sm font-bold text-primary tracking-wide">
                  100% Homemade Mini Donuts di Batam
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-secondary leading-[1.15]">
                Donat Mini Rumahan Paling <span className="text-primary underline decoration-accent decoration-wavy decoration-2">Lumer</span> & Bikin Ceria!
              </h1>

              <p className="text-base sm:text-lg text-text max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Nikmati kelembutan donat mini resep rumahan istimewa dengan 12+ pilihan topping premium melimpah. Dibuat fresh setiap hari khusus untuk memanjakan lidahmu!
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  href="#pesan"
                  variant="primary"
                  size="lg"
                  rightIcon={<span>👉</span>}
                  className="shadow-lg"
                >
                  Pesan Sekarang
                </Button>
                <Button
                  href="#katalog"
                  variant="secondary"
                  size="lg"
                  leftIcon={<span>🍩</span>}
                >
                  Lihat Varian Donat
                </Button>
              </div>

              {/* SOCIAL PROOF MINI */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="text-accent text-sm">★★★★★</span>
                  <span className="font-bold text-secondary">4.9 / 5.0</span>
                </div>
                <span>•</span>
                <span>Fresh Setiap Hari</span>
                <span>•</span>
                <span>Batam Delivery</span>
              </div>
            </div>

            {/* HERO VISUAL / DONUT ILLUSTRATION */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                {/* Decorative background rings */}
                <div className="absolute inset-0 rounded-full bg-primary-soft/60 animate-pulse -z-10"></div>
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-accent/40 -z-10"></div>

                {/* Donut Card Display */}
                <div className="relative w-4/5 aspect-square rounded-[24px] overflow-hidden border-[2px] border-border bg-surface shadow-warm-lg flex flex-col items-center justify-center p-6 text-center group hover:scale-105 transition-transform duration-300">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center text-7xl sm:text-8xl select-none">
                    🍩
                    <span className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</span>
                    <span className="absolute -bottom-1 -left-2 text-2xl animate-bounce delay-150">🍓</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-secondary mt-2">
                    Aneka Topping Lumer
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Choco Crunch • Lotus Biscoff • Tiramisu • Matcha
                  </p>
                  <span className="mt-3 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-secondary">
                    Freshly Baked Today
                  </span>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-3 -right-2 sm:right-2 rounded-full bg-surface border-[1.5px] border-border px-4 py-2 shadow-warm flex items-center gap-2">
                  <span className="text-xl">🛵</span>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-primary leading-none">Siap Antar</p>
                    <p className="text-xs font-bold text-secondary">Area Sekupang & Batam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEUNGGULAN SECTION */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            Kenapa Alfa Bites?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
            Kelezatan Rumahan yang Bikin Bahagia
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            Kami mendedikasikan setiap adonan donat mini dengan bahan terbaik agar menghasilkan gigitan yang sempurna.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "🔥",
              title: "Fresh From Oven",
              desc: "Donat digoreng dan di-topping baru setiap pagi sesuai pesanan pelanggan hari itu.",
            },
            {
              icon: "🧈",
              title: "Bahan Pilihan Premium",
              desc: "Menggunakan mentega wangi, tepung kualitas terbaik, dan cokelat glaze berkualitas tinggi.",
            },
            {
              icon: "🍫",
              title: "12+ Varian Topping",
              desc: "Pilihan topping lumer melimpah mulai dari cokelat, matcha, keju gurih, hingga biskuit lotus.",
            },
            {
              icon: "🎁",
              title: "Kemasan Cantik & Rapi",
              desc: "Dikemas dalam box higienis nan estetik, siap dijadikan camilan keluarga atau hadiah hampers.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col gap-3 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-heading text-lg font-bold text-secondary">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. KATALOG PRODUK / VARIAN DONAT (DARI SUPABASE DATABASE - US-01) */}
      <section id="katalog" className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-border/60">
          <div className="space-y-2">
            <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              Koleksi Menu
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
              Varian Donat Favorit
            </h2>
            <p className="text-sm sm:text-base text-text-muted">
              Pilih varian donat mini dengan aneka glaze dan topping lezat favoritmu.
            </p>
          </div>
          <Button
            href="#pesan"
            variant="secondary"
            size="md"
            rightIcon={<span>👉</span>}
          >
            Pesan Kotak Donat
          </Button>
        </div>

        {pesanError ? (
          <div className="rounded-[20px] border-[1.5px] border-error/30 bg-surface p-8 text-center shadow-warm">
            <p className="font-heading text-xl font-bold text-error">{pesanError}</p>
            <p className="mt-2 text-sm text-text-muted">
              Pastikan koneksi Supabase dan environment variable sudah dikonfigurasi dengan benar.
            </p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-12 text-center shadow-warm">
            <span className="text-5xl">🍩</span>
            <p className="font-heading text-2xl font-bold text-secondary mt-3">Belum ada produk</p>
            <p className="text-sm text-text-muted mt-1">Daftar donat akan segera diperbarui oleh admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>

      {/* 4. PAKET BOX & HARGA */}
      <section id="paket" className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-secondary uppercase tracking-wider">
            Pilihan Paket Hemat
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
            Paket Box Donat Mini
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            Pilih ukuran box donat yang sesuai dengan kebutuhan kumpulmu hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* PAKET 1: BOX 6 */}
          <div className="flex flex-col justify-between rounded-[20px] border-[1.5px] border-border bg-surface p-7 shadow-warm hover:shadow-warm-lg transition-all">
            <div className="space-y-4">
              <span className="rounded-full bg-bg px-3 py-1 text-xs font-bold text-text-muted">
                Personal / Santai
              </span>
              <h3 className="font-heading text-2xl font-bold text-secondary">
                Box Isi 6 (Mini Bites)
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Porsi pas untuk dinikmati sendiri atau berdua saat santai sore ditemani teh atau kopi.
              </p>
              <div className="pt-2">
                <span className="font-heading text-3xl font-bold text-primary">Rp 35.000</span>
                <span className="text-xs text-text-muted ml-1">/ box</span>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-text pt-4 border-t border-border">
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> 6 Pcs Donat Mini Empuk
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> Bebas Pilih 3 Topping Berbeda
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> Kemasan Box Eksklusif
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                href={`https://wa.me/${nomorWA}?text=${encodeURIComponent("Halo Alfa Bites! Saya mau pesan Paket Box Isi 6 (Mini Bites) seharga Rp 35.000.")}`}
                variant="secondary"
                size="md"
                fullWidth
              >
                Pesan Box Isi 6
              </Button>
            </div>
          </div>

          {/* PAKET 2: BOX 12 (PALING POPULER) */}
          <div className="relative flex flex-col justify-between rounded-[20px] border-2 border-primary bg-surface p-7 shadow-warm-lg transition-all scale-100 md:scale-105 z-10">
            {/* POPULAR BADGE */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-secondary shadow-md uppercase tracking-wider">
              🔥 Paling Populer
            </div>
            <div className="space-y-4">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                Favorit Keluarga
              </span>
              <h3 className="font-heading text-2xl font-bold text-secondary">
                Box Isi 12 (Family Pack)
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Ukuran paling favorit untuk dinikmati bersama keluarga tercinta atau kado orang tersayang.
              </p>
              <div className="pt-2">
                <span className="font-heading text-4xl font-bold text-primary">Rp 65.000</span>
                <span className="text-xs text-text-muted ml-1">/ box</span>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-text pt-4 border-t border-border">
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> 12 Pcs Donat Mini Lumer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> Bebas Mix Hingga 6 Topping
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> Box Premium + Pita Cantik
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> Kartu Ucapan (Request Gratis)
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                href={`https://wa.me/${nomorWA}?text=${encodeURIComponent("Halo Alfa Bites! Saya mau pesan Paket Box Isi 12 (Family Pack) seharga Rp 65.000.")}`}
                variant="primary"
                size="md"
                fullWidth
                rightIcon={<span>✨</span>}
              >
                Pesan Box Isi 12
              </Button>
            </div>
          </div>

          {/* PAKET 3: BOX 24 */}
          <div className="flex flex-col justify-between rounded-[20px] border-[1.5px] border-border bg-surface p-7 shadow-warm hover:shadow-warm-lg transition-all">
            <div className="space-y-4">
              <span className="rounded-full bg-bg px-3 py-1 text-xs font-bold text-text-muted">
                Pesta & Rapat
              </span>
              <h3 className="font-heading text-2xl font-bold text-secondary">
                Box Isi 24 (Party Box)
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Paling pas untuk perayaan ulang tahun, arisan, rapat kantor, atau kumpul teman-teman.
              </p>
              <div className="pt-2">
                <span className="font-heading text-3xl font-bold text-primary">Rp 120.000</span>
                <span className="text-xs text-text-muted ml-1">/ box</span>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-text pt-4 border-t border-border">
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> 24 Pcs Donat Mini Melimpah
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> Bebas Mix Semua Varian Topping
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success font-bold">✓</span> Box Besar Kokoh & Higienis
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                href={`https://wa.me/${nomorWA}?text=${encodeURIComponent("Halo Alfa Bites! Saya mau pesan Paket Box Isi 24 (Party Box) seharga Rp 120.000.")}`}
                variant="secondary"
                size="md"
                fullWidth
              >
                Pesan Box Isi 24
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CARA PEMESANAN */}
      <section id="cara-pesan" className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="rounded-[24px] border-[1.5px] border-border bg-surface p-8 sm:p-14 shadow-warm">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              Mudah & Cepat
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
              Cara Memesan di Alfa Bites
            </h2>
            <p className="text-sm text-text-muted">
              Hanya 4 langkah mudah untuk menikmati donat mini hangat di depan pintumu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: "1",
                title: "Pilih Varian & Paket",
                desc: "Tentukan paket box donat mini dan rasa topping yang kamu sukai.",
              },
              {
                step: "2",
                title: "Hubungi WhatsApp",
                desc: "Klik tombol Pesan via WhatsApp atau isi formulir pemesanan online.",
              },
              {
                step: "3",
                title: "Konfirmasi & Bayar",
                desc: "Admin akan mengonfirmasi total dan mengirimkan nomor rekening / QRIS.",
              },
              {
                step: "4",
                title: "Donat Diantar Fresh",
                desc: "Donat lezatmu selesai dibuat dan langsung dikirim kurir ke alamatmu.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-heading text-2xl font-bold text-white shadow-md">
                  {item.step}
                </div>
                <h3 className="font-heading text-lg font-bold text-secondary">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONI PELANGGAN */}
      <section id="testimoni" className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            Cerita Pelanggan
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
            Apa Kata Mereka Tentang Alfa Bites?
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            Kepuasan gigitan pertama yang membuat mereka terus kembali memesan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              nama: "Nadia Rahmawati",
              lokasi: "Sekupang, Batam",
              rating: 5,
              teks: "Donatnya lembut banget dan nggak kemanisan! Topping choco crunchy dan tiramisunya nagih parah. Anak-anak di rumah langsung ludes dalam sekejap.",
            },
            {
              nama: "Budi Santoso",
              lokasi: "Batam Center",
              rating: 5,
              teks: "Pesan Box isi 24 buat acara reuni kantor kemarin. Semuanya pada nanya beli di mana karena kemasannya rapi dan donatnya empuk walau udah sore.",
            },
            {
              nama: "Citra Lestari",
              lokasi: "Batu Aji, Batam",
              rating: 5,
              teks: "Pelayanan ramah dan pengiriman tepat waktu. Topping lotus biscoff sama matchanya beneran juara umum. Langganan tetap tiap akhir pekan!",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-[20px] border-[1.5px] border-border bg-surface p-6 sm:p-7 shadow-warm hover:shadow-warm-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-accent text-lg">
                  {"★".repeat(item.rating)}
                </div>
                <p className="text-sm text-text leading-relaxed italic">
                  &ldquo;{item.teks}&rdquo;
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/50 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-heading font-bold text-primary">
                  {item.nama.charAt(0)}
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-secondary">{item.nama}</p>
                  <p className="text-[11px] text-text-muted">{item.lokasi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FORM PEMESANAN CEPAT (MENGGUNAKAN INPUT & BUTTON) */}
      <section id="pesan" className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            Order Cepat
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
            Pesan Donat Mini Sekarang
          </h2>
          <p className="text-sm text-text-muted">
            Tentukan pesananmu dan kami akan langsung menyiapkan donat terbaik untukmu.
          </p>
        </div>

        <FormPemesanan />
      </section>

      {/* 8. FAQ SECTION (ACCORDION DENGAN BUTTON) */}
      <section id="faq" className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <span className="rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-secondary uppercase tracking-wider">
            Tanya Jawab
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
            Pertanyaan Sering Diajukan
          </h2>
          <p className="text-sm text-text-muted">
            Informasi lengkap seputar produksi, ketahanan, dan pengantaran donat kami.
          </p>
        </div>

        <FaqSection />
      </section>

      {/* 9. CTA PENUTUP */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
        <div className="relative overflow-hidden rounded-[24px] bg-primary px-6 py-14 sm:px-12 sm:py-16 text-center text-white shadow-warm-lg">
          {/* Subtle background circles */}
          <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-accent/20 blur-xl"></div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <span className="text-4xl animate-bounce">🍩</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Siap Bikin Harimu Lebih Manis & Ceria?
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-lg">
              Slot produksi donat harian kami terbatas agar tetap fresh. Hubungi kami sekarang dan amankan box donat favoritmu hari ini!
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Button
                href="#pesan"
                variant="contrast"
                size="lg"
                rightIcon={<span>👉</span>}
              >
                Pesan Donat Sekarang
              </Button>
              <Button
                href={`https://wa.me/${nomorWA}`}
                variant="secondary"
                size="lg"
                className="!bg-white/20 !border-white !text-white hover:!bg-white hover:!text-primary"
              >
                Chat WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
