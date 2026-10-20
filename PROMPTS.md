# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca AGENTS.md dan docs/user-stories.md bagian US-01.

Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.

Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Membuat helper koneksi Supabase server di `lib/supabase/server.js` dan `lib/supabase/index.js` dengan `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`.
- Memperbarui `app/page.jsx` menjadi Server Component yang mengambil produk langsung dari tabel `produk` di Supabase.
- Menampilkan daftar produk menggunakan komponen `KartuProduk`.
- Menampilkan pesan "Belum ada produk" saat tabel kosong dan pesan error jika query gagal.
- Menghapus komponen `CatatanBelumAktif` dan ketergantungan pada `lib/data-contoh.js`.

**Perbaikan:**
- Menambahkan sanitasi URL pada koneksi Supabase untuk otomatis membersihkan trailing slash atau path `/rest/v1` bila ada pada environment variable.

## US-02 Detail produk

**Prompt:**
Baca docs/user-stories.md bagian US-02.

Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
- Mengubah `app/produk/[id]/page.jsx` agar mengambil data produk dari tabel `produk` di database Supabase berdasarkan parameter `id` di sisi server menggunakan `buatKlienServer`.
- Menangani produk yang tidak ditemukan atau query error dengan memanggil `notFound()`.
- Menghapus komponen `CatatanBelumAktif` dan pemanggilan `cariProdukContoh` dari `lib/data-contoh.js`.
- Mempertahankan tata letak tampilan serta komponen `TombolWhatsApp`.

**Perbaikan:**
- Tidak ada perbaikan / kendala: implementasi dan build berhasil tanpa hambatan.

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)".

Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
- Mengubah `components/TombolWhatsApp.jsx` menjadi elemen tautan (`<a>`) yang mengarah ke `https://wa.me/<nomor>?text=<pesan>`.
- Nomor WhatsApp diambil dari `lib/toko.js`.
- Pesan otomatis dibuat menyertakan nama produk dan harga terformat rupiah (`formatRupiah`), serta di-encode dengan `encodeURIComponent`.
- Menambahkan `target="_blank"` dan `rel="noopener noreferrer"` untuk membuka WhatsApp di tab baru.
- Mempertahankan tampilan dan class tombol.
- Memastikan komponen `CatatanBelumAktif` sudah bersih dari halaman detail produk.

**Perbaikan:**
- Tidak ada perbaikan / kendala: implementasi dan build berhasil tanpa hambatan.

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.

Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
- Menambahkan fungsi helper `buatKlienSesiAdmin` di `lib/supabase/server.js` menggunakan `@supabase/ssr` dan cookie storage berbasis Next.js `cookies()`, didukung `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY`.
- Membuat Server Action `login` dan `keluar` di `app/admin/actions.js` untuk autentikasi Supabase Auth (`signInWithPassword` dan `signOut`).
- Memperbarui `app/admin/login/page.jsx` agar memproses login via Server Action, menampilkan pesan error yang ramah pengguna jika gagal, dan mempertahankan input email.
- Mengaktifkan tombol "Keluar" pada `components/NavAdmin.jsx` untuk mengakhiri sesi dan mengarahkan kembali ke `/admin/login`.
- Menghapus komponen `CatatanBelumAktif` dari halaman login.

**Perbaikan:**
- Tidak ada perbaikan / kendala: implementasi dan build berhasil tanpa hambatan.

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05.

Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Membuat Server Action `gantiPassword` di `app/admin/actions.js` dengan validasi server (minimal 8 karakter dan kesamaan dengan konfirmasi).
- Memeriksa sesi aktif admin menggunakan `supabase.auth.getUser()` sebelum memperbarui password dengan `supabase.auth.updateUser({ password })`.
- Menyambungkan form di `app/admin/password/page.jsx` ke Server Action `gantiPassword`.
- Menampilkan pesan sukses berwarna hijau (`text-utama`) atau pesan error berwarna merah (`text-bahaya`) di atas form.
- Menghapus komponen `CatatanBelumAktif` dari halaman ganti password tanpa mengubah layout form.

**Perbaikan:**
- Tidak ada perbaikan / kendala: validasi dan build berhasil tanpa hambatan.

## US-06 Proteksi halaman admin

**Prompt:**
Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06.

Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
- Membuat file `proxy.js` di root proyek untuk memproteksi semua rute `/admin/*` (kecuali `/admin/login`) menggunakan sesi Supabase Auth dengan `@supabase/ssr`. Jika pengguna belum terautentikasi, otomatis dialihkan ke `/admin/login`.
- Memastikan setiap Server Action yang memodifikasi data (seperti `gantiPassword`) memeriksa login admin di sisi server menggunakan `supabase.auth.getUser()`.
- Menghapus komponen `CatatanBelumAktif` dari halaman `app/admin/page.jsx`.

**Perbaikan:**
- Tidak ada perbaikan / kendala: file `proxy.js` langsung dikenali dan terkompilasi sebagai proxy/middleware oleh Next.js 16.

## Debugging dan fitur bonus

### Redesign & Styling Alfa Bites (Brand Donat Mini Rumahan)

**Prompt:**

Saat ini website masih berbentuk template kasar. Tolong styling ulang seluruh website Alfa Bites (brand donat mini rumahan) agar terlihat hangat, ceria, modern, dan konsisten.
ATURAN UTAMA
1. Jangan ada text link. Semua elemen yang bisa diklik (navigasi, CTA, footer, sosial media, kartu produk) harus menggunakan komponen Button.
2. Buat SATU komponen Button terpusat untuk semua jenis button. Dilarang membuat style button terpisah di halaman atau section lain.
3. Buat komponen Input terpusat untuk semua jenis input.
4. Gunakan color palette dan design tokens di bawah, jangan menulis warna hex langsung di komponen. Semua warna, radius, shadow, dan spacing harus lewat CSS variables atau token.

COLOR PALETTE (design tokens)
--color-primary: #C93868
--color-primary-hover: #B02E5A
--color-primary-active: #962650
--color-primary-soft: #FDE3EA
--color-secondary: #4A2C2A
--color-accent: #F2A33A
--color-bg: #FFF7EC
--color-surface: #FFFFFF
--color-border: #F0DCCB
--color-text: #5C4440
--color-text-muted: #8A716B
--color-success: #3E9B6B
--color-error: #D93F3F
--color-info: #3F7FBF

TIPOGRAFI
- Heading: Fredoka (atau Baloo 2), weight 600 sampai 700, warna --color-secondary
- Body: Nunito, weight 400 sampai 600, warna --color-text
- Skala responsif: H1 40 sampai 56px, H2 32 sampai 40px, H3 24px, body 16px, caption 14px
- Line height body 1.6, heading 1.2

STYLE UMUM
- Background halaman --color-bg, card dan section kontras memakai --color-surface
- Radius: 12px untuk input dan card kecil, 20px untuk card besar, 999px (pill) untuk button dan badge
- Shadow lembut dan hangat, contoh: 0 8px 24px rgba(74, 44, 42, 0.08)
- Spacing konsisten berbasis kelipatan 8px, padding section vertikal 64 sampai 96px
- Layout max-width 1200px, grid responsif (mobile first), breakpoint 640, 768, 1024, 1280
- Transisi halus 150 sampai 250ms ease pada hover, focus, dan active
- Gunakan elemen dekoratif ringan bertema donat (bentuk lingkaran, sprinkle, wave divider antar section), jangan berlebihan
- Gambar produk dengan rasio konsisten, rounded, dan lazy loading

KOMPONEN BUTTON (satu komponen, banyak varian)
Props: variant, size, fullWidth, loading, disabled, leftIcon, rightIcon, iconOnly, href (jika ada href, render sebagai anchor tetapi tampilannya tetap button), onClick.

Varian:
- Primary: background --color-primary, teks putih, hover --color-primary-hover, active --color-primary-active, shadow lembut. Untuk aksi utama seperti "Pesan Sekarang".
- Secondary: background --color-primary-soft, teks --color-primary, border 1.5px --color-primary, hover background --color-primary dengan teks putih. Untuk aksi pendukung seperti "Lihat Varian Rasa".
- Tertiary: background transparan, tanpa border, teks --color-secondary, hover background --color-primary-soft. Untuk navigasi, menu, footer, dan aksi ringan. Pengganti text link, tampil sebagai button dengan area klik jelas.

Ukuran: sm (tinggi 36px), md (44px, default), lg (52px). Padding horizontal proporsional, font weight 700.

State wajib: default, hover, active (sedikit scale 0.98), focus-visible (ring 3px --color-accent dengan offset 2px), disabled (opacity 50%, cursor not-allowed), loading (spinner kecil, klik dinonaktifkan).

Aksesibilitas: area sentuh minimal 44px di mobile, gunakan elemen semantik (button atau anchor), aria-label untuk iconOnly.

KOMPONEN INPUT (satu komponen terpusat)
Buat komponen Field yang membungkus label, input, helper text, dan pesan error, lalu sediakan tipe berikut:
- Text, Email, Phone (tel), Password (dengan tombol show/hide), Number
- Search (dengan ikon dan tombol clear)
- Textarea (dengan counter karakter opsional)
- Select dan Dropdown
- Checkbox dan Radio (custom, warna --color-primary)
- Switch/Toggle
- Date dan Time picker
- Quantity Stepper (tombol minus dan plus, untuk jumlah box donat)
- File/Image upload (area drag and drop sederhana)

Style input: background --color-surface, border 1.5px --color-border, radius 12px, tinggi 48px, padding 12 sampai 16px, placeholder --color-text-muted. Focus: border --color-primary dengan ring lembut --color-primary-soft. Error: border --color-error, pesan error kecil di bawah dengan ikon. Success: border --color-success. Disabled: background lebih pudar dan cursor not-allowed. Label selalu terlihat di atas input (jangan hanya placeholder), tandai field wajib dengan tanda bintang.

PENERAPAN PER BAGIAN
- Navbar: logo di kiri, menu memakai Button tertiary, CTA "Pesan Sekarang" memakai Button primary. Sticky dengan background blur ringan. Di mobile jadi menu hamburger.
- Hero: headline besar, subheadline, dua button (primary dan secondary), gambar donat di sisi kanan.
- Keunggulan: grid card dengan ikon, hover naik sedikit.
- Varian rasa: card produk dengan gambar, nama, deskripsi, dan Button "Tambah" atau "Pesan".
- Paket dan harga: card dengan paket paling populer diberi badge --color-accent.
- Cara pemesanan: step bernomor dengan lingkaran --color-primary.
- Testimoni: card dengan kutipan dan rating bintang --color-accent.
- FAQ: accordion, header tiap item berupa button.
- Form pemesanan: gunakan komponen Input dan Button yang sudah dibuat.
- CTA penutup: background --color-primary, teks putih, button versi kontras (putih dengan teks --color-primary).
- Footer: background --color-secondary, teks krem, semua tautan memakai Button tertiary versi terang.

OUTPUT YANG DIHARAPKAN
1. File design tokens (CSS variables)
2. Komponen Button terpusat
3. Komponen Input atau Field terpusat dengan semua tipe di atas
4. Styling seluruh halaman yang memakai komponen tersebut
5. Pastikan responsif, kontras warna lolos WCAG AA, dan tidak ada style duplikat atau warna hardcode

**Hasil:**
- Membuat file design tokens lengkap di `app/globals.css` (`@theme` dan `:root`) dengan warna donat hangat (`--color-primary`, `--color-secondary`, `--color-accent`, dll), tipografi Fredoka & Nunito via Google Fonts, radius (12px, 20px, 999px pill), serta shadow lembut.
- Membangun satu komponen `Button.jsx` terpusat dengan varian `primary`, `secondary`, `tertiary`, `contrast`, `danger`, `tertiary-light`, ukuran `sm`, `md`, `lg`, serta mendukung rendering semantik `<button>` atau `<a>`/`<Link>` dengan touch target minimal 44px di mobile.
- Membangun satu komponen `Input.jsx` terpusat yang mendukung semua jenis input: text, email, tel, password (dengan toggle show/hide), search (dengan clear button), textarea (dengan counter), select/dropdown, checkbox, radio, switch, date/time, quantity stepper, dan file drag & drop.
- Menghapus semua plain text link di seluruh website dan menggantikannya dengan komponen `Button` terpusat.
- Menata ulang komponen `Header.jsx` (sticky dengan blur & mobile hamburger), `Footer.jsx` (warna cokelat sekunder donat dan tombol tertiary-light), `KartuProduk.jsx` (card donat bulat lembut dengan lazy loading), `TombolWhatsApp.jsx`, `TabelProduk.jsx`, `FormProduk.jsx`, serta halaman not-found.
- Mengimplementasikan seluruh section beranda pada `app/page.jsx`: Hero, Keunggulan, Varian Donat dari Supabase (US-01), Paket Box Donat & Harga, Cara Pemesanan, Testimoni, Form Pemesanan WhatsApp Interaktif (`FormPemesanan.jsx`), Accordion FAQ (`FaqSection.jsx`), dan CTA penutup.
- Memperbarui halaman detail (`app/produk/[id]/page.jsx`) dan halaman admin (`/admin`, `/admin/login`, `/admin/password`) agar serasi dengan styling hangat donat mini.
- Memperbarui dokumentasi desain pada `DESIGN.md`.

**Perbaikan:**
- Tidak ada perbaikan / kendala: seluruh komponen dan halaman terkompilasi dengan sempurna pada Turbopack Next.js 16 tanpa error atau warna hardcode.

### US-07 List Produk

**Prompt:**
## US-07 List Produk

Baca kriteria US-07 di docs/user-stories.md.
Kondisi saat ini: app/admin/page.jsx mengimpor produkContoh dari @/lib/data-contoh lalu `const daftarProduk = produkContoh`, jadi daftar produk admin bukan dari Supabase.
Tugas: ganti dengan query ke tabel "produk" di Supabase (server component, memakai Supabase server client). Tampilkan hasilnya di TabelProduk (nama, kategori, harga, foto). Tambahkan empty state dan error state. Hapus import data contoh dari halaman ini.

**Hasil:**
- Mengubah `app/admin/page.jsx` menjadi async Server Component yang mengambil data produk langsung dari tabel `produk` di database Supabase pada sisi server.
- Menghapus import data contoh (`produkContoh` dari `lib/data-contoh.js`).
- Menampilkan data produk ke dalam `TabelProduk` dengan informasi lengkap: foto produk (lazy loading), nama donat, kategori donat, dan harga terformat Rupiah.
- Menambahkan penanganan empty state jika tabel produk di database masih kosong (pada level page dan tabel).
- Menambahkan penanganan error state jika terjadi kegagalan query database dengan tampilan pesan error yang jelas.
- Memastikan pengecekan autentikasi admin di server component sebelum merender halaman.

**Perbaikan:**
- Tidak ada perbaikan / kendala: build dan integrasi database berjalan lancar tanpa error.
