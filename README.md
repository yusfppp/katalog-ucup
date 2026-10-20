# Alfa Bites — Katalog UMKM + Order WhatsApp

Website katalog produk **Alfa Bites** (_Small Bites, Big Smiles._), UMKM makanan/minuman di Batam. Pengunjung melihat katalog dan detail produk dari database, lalu memesan langsung lewat WhatsApp dengan pesan otomatis. Pemilik toko mengelola produk, kategori, banner, ulasan, dan pengaturan toko lewat halaman admin yang aman.

**Link:** _isi dengan link Vercel-mu_

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyusfppp%2Fkatalog-ucup&project-name=katalog-ucup&repository-name=katalog-ucup)

## Fitur

### Pengunjung

- Katalog dari Supabase dengan pencarian, filter kategori, urutan (termurah, termahal, terbaru), dan paginasi.
- Halaman detail produk: galeri foto, varian ukuran/harga, stok, harga diskon, badge, produk terkait, rating, dan ulasan.
- Pesan via WhatsApp dengan nama produk, varian, jumlah, dan harga otomatis.
- Keranjang belanja yang tersimpan di browser dan bisa dikirim sebagai satu pesan WhatsApp.
- Favorit, perbandingan dua produk, dan daftar "Terakhir dilihat".
- Banner promo aktif di beranda dan halaman kategori `/kategori/[slug]`.
- Asisten AI tanya jawab produk (Gemini, dipanggil dari server).
- Mode gelap yang tersimpan, PWA yang bisa dipasang di layar utama, serta halaman offline.
- Halaman Tentang/Kontak, 404 dan loading kustom, metadata Open Graph, sitemap, dan robots.

### Admin

- Login Supabase Auth, ganti password, dan proteksi seluruh rute `/admin` lewat `proxy.js`.
- Dashboard ringkasan produk, jumlah per kategori, dan 5 produk terlaris berdasarkan klik WhatsApp.
- Tambah, ubah, hapus, aktif/nonaktif, cari, paginasi, dan atur urutan produk.
- Unggah foto utama dan galeri ke Supabase Storage, serta pengelolaan varian harga.
- Kelola kategori, banner promo, moderasi ulasan, dan pengaturan identitas toko.
- Impor produk dari CSV (dengan laporan baris gagal) dan ekspor seluruh produk ke CSV.
- Kelola akun admin lain dan log aktivitas admin.
- Validasi server per field; semua aksi mutasi memeriksa sesi admin.

## Menjalankan di laptop

1. **Clone repo.**

   ```bash
   git clone https://github.com/yusfppp/katalog-ucup.git
   cd katalog-ucup
   npm install
   ```

2. **Siapkan Supabase.** Buat proyek baru di [supabase.com](https://supabase.com), buka **SQL Editor**, lalu jalankan dua file secara berurutan:
   - `docs/schema.sql` — tabel `produk` dan data awal.
   - `docs/migration-fitur-bonus.sql` — tabel/kolom fitur bonus, RLS, dan bucket Storage `foto-produk`.

   Keduanya aman dijalankan ulang. **Jalankan migrasi sebelum memakai fitur admin lanjutan**, karena aplikasi membutuhkan kolom dan tabel baru tersebut.

3. **Siapkan akun admin** lewat dashboard Supabase (**Authentication > Users**), lalu matikan pendaftaran akun baru di **Authentication > Sign In / Providers**.
4. **Buat file `.env.local`.** Salin `.env.example` menjadi `.env.local`, lalu isi:
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` — dari Supabase > **Project Settings > API**.
   - `GEMINI_API_KEY` — opsional, untuk deskripsi produk AI dan asisten tanya jawab.
   - `SITE_URL` — alamat publik situs, dipakai metadata, sitemap, dan robots.

   Jangan memberi awalan `NEXT_PUBLIC_` pada variabel mana pun.

5. **Jalankan.**

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`. Login admin ada di `http://localhost:3000/admin/login`.

## Deploy ke Vercel

1. Klik tombol **Deploy with Vercel** di atas, atau impor repo `yusfppp/katalog-ucup` lewat dashboard Vercel.
2. Isi environment variable yang sama di **Settings > Environment Variables**.
3. Setelah selesai, setiap `git push` akan otomatis men-deploy versi terbaru.

## Struktur repo

| File atau folder | Isi |
| --- | --- |
| `AGENTS.md` | Aturan untuk AI agent, dibaca sebelum setiap prompt |
| `DESIGN.md` | Panduan warna, huruf, dan komponen |
| `PROMPTS.md` | Jurnal prompt |
| `docs/` | PRD, user story, rancangan teknis, skema, dan migrasi database |
| `proxy.js` | Proteksi rute `/admin` selain halaman login |
| `lib/supabase/` | Client Supabase sisi server |
| `lib/actions/` | Server Action untuk admin dan publik |
| `lib/produk.js` | Query produk, kategori, banner, ulasan, dan ringkasan dashboard |
| `lib/toko.js` | Pengaturan toko dari database dengan cadangan `lib/toko-cadangan.js` |
| `app/` | Halaman aplikasi, route CSV, manifest, sitemap, dan robots |
| `components/` | Komponen tampilan |
| `public/` | Aset gambar, ikon PWA, dan service worker |

## Menyesuaikan

- Identitas toko (nama, nomor WhatsApp, alamat, jam buka, Instagram): ubah lewat `/admin/pengaturan`. Cadangan awal ada di `lib/toko-cadangan.js`.
- Produk, kategori, banner, dan ulasan: kelola lewat halaman admin.
- Warna dan token mode gelap: ubah bagian `@theme`, `:root`, dan `:root[data-theme="dark"]` di `app/globals.css` (lihat `DESIGN.md`).

## Aturan penting

- Jangan menyimpan kunci atau password di kode, dan jangan push file `.env.local`.
- Jangan memberi awalan `NEXT_PUBLIC_` pada environment variable.
- Akses Supabase hanya dari sisi server (Server Component, Server Action, atau Route Handler).
- Jangan mematikan Row Level Security.
- Isi `PROMPTS.md` setiap menyelesaikan fitur.

## Tentang aplikasi ini

- **Nama usaha:** Alfa Bites
- **Pembuat:**
- **Link aplikasi:**
- **Fitur bonus yang dikerjakan:** US-07 sampai US-50
