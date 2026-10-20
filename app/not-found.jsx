import Button from "@/components/Button";

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-lg flex flex-col items-center text-center gap-6 rounded-[20px] border-[1.5px] border-border bg-surface p-8 sm:p-12 shadow-warm">
        <span className="text-6xl animate-bounce">🍩</span>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-text-muted leading-relaxed">
            Ups! Varian donat atau halaman yang kamu cari sepertinya sudah habis atau berpindah tempat.
          </p>
        </div>
        <Button href="/" variant="primary" size="lg" leftIcon={<span>🏠</span>}>
          Kembali ke Beranda Donat
        </Button>
      </div>
    </div>
  );
}
