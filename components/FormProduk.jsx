import Input from "@/components/Input";
import Button from "@/components/Button";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
export default function FormProduk({ produk = {}, labelTombol }) {
  return (
    <form className="flex max-w-xl flex-col gap-5 bg-surface p-6 sm:p-8 rounded-[20px] border-[1.5px] border-border shadow-warm">
      <Input
        label="Nama donat"
        name="nama"
        defaultValue={produk.nama}
        required
        placeholder="Contoh: Donat Mini Choco Crunch"
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
        placeholder="Contoh: 35000"
      />
      <Input
        label="Kategori"
        name="kategori"
        defaultValue={produk.kategori}
        placeholder="Contoh: Best Seller / Special Topping"
      />
      <Input
        label="Link foto donat"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <Input
        label="Deskripsi donat"
        name="deskripsi"
        textarea
        defaultValue={produk.deskripsi}
        placeholder="Jelaskan rasa, tekstur, dan topping donat ini..."
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">
          {labelTombol}
        </Button>
        <Button href="/admin" variant="secondary">
          Batal
        </Button>
      </div>
    </form>
  );
}
