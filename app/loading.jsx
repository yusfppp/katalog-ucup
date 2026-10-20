export default function Loading() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-12 sm:px-6" role="status" aria-label="Memuat halaman">
      <div className="h-10 w-56 animate-pulse rounded-full bg-border/60" />
      <div className="h-56 animate-pulse rounded-[24px] bg-border/50" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-80 animate-pulse rounded-[20px] bg-border/50" />
        ))}
      </div>
      <span className="sr-only">Memuat halaman...</span>
    </div>
  );
}
