# Panduan Tampilan - Alfa Bites (Brand Donat Mini Rumahan)

Panduan desain untuk brand donat mini homemade Alfa Bites. Tampilan dirancang hangat, ceria, modern, dan konsisten.

## Color Palette (Design Tokens)

Semua warna diatur melalui CSS variables di `app/globals.css` (`@theme` dan `:root`). Dilarang menulis nilai hex langsung di dalam komponen.

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--color-primary` | `#C93868` | Warna merek utama, tombol CTA utama, harga donat, highlight |
| `--color-primary-hover` | `#B02E5A` | State hover untuk tombol utama |
| `--color-primary-active` | `#962650` | State active / pressed |
| `--color-primary-soft` | `#FDE3EA` | Latar badge, chip, focus ring lembut, varian tombol secondary |
| `--color-secondary` | `#4A2C2A` | Warna heading (cokelat tua donat), teks kontras, latar footer |
| `--color-accent` | `#F2A33A` | Aksen ceria (kuning karamel), rating bintang, badge populer |
| `--color-bg` | `#FFF7EC` | Background halaman (krem hangat khas adonan donat) |
| `--color-surface` | `#FFFFFF` | Background card, container form, navbar |
| `--color-border` | `#F0DCCB` | Garis tepi, pembatas section, input border |
| `--color-text` | `#5C4440` | Teks body utama (cokelat hangat mudah dibaca) |
| `--color-text-muted` | `#8A716B` | Teks pendukung, keterangan, placeholder |
| `--color-success` | `#3E9B6B` | Indikator sukses, centang keunggulan |
| `--color-error` | `#D93F3F` | Pesan error, tanda wajib (*), tombol aksi berbahaya |
| `--color-info` | `#3F7FBF` | Informasi umum |

## Tipografi

- **Heading**: `Fredoka` (atau Baloo 2), weight 600 - 700, warna `var(--color-secondary)`. Line height 1.2.
- **Body**: `Nunito`, weight 400 - 600, warna `var(--color-text)`. Line height 1.6.
- **Skala responsif**:
  - H1: 40px - 56px
  - H2: 32px - 40px
  - H3: 24px
  - Body: 16px
  - Caption: 14px

## Radius & Shadow

- **Radius**:
  - `12px` (`rounded-xl`): Input, card kecil, tombol stepper
  - `20px` (`rounded-[20px]`): Card produk, paket, testimonial, container form
  - `999px` (`rounded-full`): Button (pill shape), badge, avatar
- **Shadow**:
  - Soft & warm: `0 8px 24px rgba(74, 44, 42, 0.08)` (`shadow-warm`)
  - Hover shadow: `0 16px 36px rgba(74, 44, 42, 0.12)` (`shadow-warm-lg`)

## Aturan Utama Komponen

1. **Dilarang ada text link**: Seluruh elemen yang dapat diklik (navigasi, kartu, footer, CTA) wajib menggunakan komponen `Button`.
2. **SATU Komponen Button Terpusat**: Komponen `components/Button.jsx` menangani semua varian (`primary`, `secondary`, `tertiary`, `contrast`, `danger`, `tertiary-light`), ukuran (`sm`, `md`, `lg`), state (default, hover, active, focus-visible, disabled, loading), serta rendering semantic (sebagai `<button>` atau `<a>`/`<Link>` bila ada prop `href`).
3. **SATU Komponen Input Terpusat**: Komponen `components/Input.jsx` menangani seluruh varian field form (text, email, tel, password show/hide, search clearable, textarea dengan counter, select, checkbox, radio, switch, date/time, quantity stepper, file drag & drop).
4. **Layout**: Max-width 1200px, responsif mobile-first. Padding vertikal section 64px - 96px (`py-16 md:py-24`).
