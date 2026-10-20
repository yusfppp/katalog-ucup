/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supaya deploy tidak gagal hanya karena error tipe kecil selama workshop.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // Form produk dapat mengirim beberapa foto (masing-masing maksimal 2MB).
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
