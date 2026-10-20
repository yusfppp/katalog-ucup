import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PwaDaftar from "@/components/PwaDaftar";
import { KeranjangProvider } from "@/components/KeranjangProvider";
import { ambilPengaturan } from "@/lib/toko";
import { ambilSiteUrl } from "@/lib/site";

export async function generateMetadata() {
  const toko = await ambilPengaturan();
  const judul = `${toko.nama} - Katalog Camilan Rumahan`;
  const deskripsi = `${toko.tagline} Lihat katalog, pilih varian, dan pesan langsung lewat WhatsApp.`;

  return {
    metadataBase: new URL(ambilSiteUrl()),
    title: {
      default: judul,
      template: `%s | ${toko.nama}`,
    },
    description: deskripsi,
    applicationName: toko.nama,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: "/icons/icon-192.png",
      apple: "/icons/icon-192.png",
    },
    openGraph: {
      title: judul,
      description: deskripsi,
      siteName: toko.nama,
      locale: "id_ID",
      type: "website",
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: toko.nama }],
    },
  };
}

const skripTema = `(function(){try{var t=localStorage.getItem('alfa-bites:tema');if(t!=='dark'&&t!=='light'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default async function RootLayout({ children }) {
  const toko = await ambilPengaturan();

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-text antialiased selection:bg-primary-soft selection:text-primary">
        <KeranjangProvider>
          <Header toko={toko} />
          <main className="w-full flex-1">{children}</main>
          <Footer toko={toko} />
          <PwaDaftar />
        </KeranjangProvider>
      </body>
    </html>
  );
}
