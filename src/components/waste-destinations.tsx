import { useState } from "react";
import { ArrowUpRight, MapPin, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = "organik" | "anorganik" | "b3" | "residu";
const destinations: { name: string; area: string; categories: Category[]; description: string; href: string; action: string }[] = [
  { name: "Bank Sampah Vijasukma", area: "Pedungan, Denpasar Selatan", categories: ["anorganik"], description: "Menangani plastik, kertas, kaca, botol, dan minyak jelantah. Tanyakan jenis yang diterima dan ketentuan penyetoran terlebih dahulu.", href: "https://banksampahvijasukma.com/", action: "Cek informasi & kontak" },
  { name: "Temesi Recycling", area: "Temesi, Gianyar", categories: ["organik", "anorganik"], description: "Mengolah sampah organik menjadi kompos dan mendaur ulang anorganik. Hubungi pengelola untuk memastikan layanan dan penerimaan sampah rumah tangga.", href: "https://temesirecycling.com/contact-us/", action: "Hubungi pengelola" },
  { name: "DLH Kabupaten Buleleng", area: "Buleleng · konsultasi penanganan B3", categories: ["b3"], description: "Minta arahan untuk baterai, elektronik, dan limbah berbahaya rumah tangga. Ini kontak panduan, bukan titik setor umum yang sudah dikonfirmasi.", href: "https://dlh.bulelengkab.go.id/informasi/detail/artikel/12_limbah-baterai-berbahaya-jangan-buang-sembarang", action: "Lihat panduan & kontak" },
  { name: "Informasi persampahan Denpasar", area: "Kota Denpasar · direktori resmi", categories: ["organik", "anorganik", "residu"], description: "Temukan informasi TPS3R dan bank sampah dari pemerintah kota. Untuk residu, tanyakan layanan pengangkutan kepada petugas atau pengelola lingkungan setempat.", href: "https://denpasarkota.go.id/page/informasi-pengelolaan-sampah", action: "Buka direktori resmi" },
];

export function WasteDestinations({ category }: { category?: Category }) {
  const [filter, setFilter] = useState<Category | "semua">(category ?? "semua");
  return (
    <section id="tempat" className="border-t border-border py-12 md:py-16">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary"><MapPin className="size-4" /> SALURKAN DENGAN TEPAT</p>
      <h2 className="text-3xl font-extrabold">Sudah dipilah, ke mana selanjutnya?</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">Pilihan pengolah dan sumber informasi di Bali. Pastikan jenis sampahmu diterima sebelum berangkat.</p>
      <div className="my-6 flex flex-wrap gap-2" role="group" aria-label="Jenis sampah untuk rekomendasi">
        {([ ["semua", "Semua"], ["organik", "Organik"], ["anorganik", "Anorganik"], ["b3", "B3"], ["residu", "Residu"] ] as const).map(([value, label]) => <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</Button>)}
      </div>
      {filter === "b3" && <p className="mb-5 flex items-start gap-2 text-sm text-destructive"><ShieldAlert className="size-5 shrink-0" /> Pisahkan limbah B3 dari sampah biasa. Jangan membongkar atau membakarnya; minta arahan petugas.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {destinations.filter((d) => filter === "semua" || d.categories.includes(filter)).map((d) => (
          <article key={d.name} className="flex flex-col rounded-lg border border-border bg-card p-5">
            <p className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="size-4 shrink-0" />{d.area}</p>
            <h3 className="mt-3 text-xl font-bold">{d.name}</h3>
            <p className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
            <Button asChild variant="link" className="mt-auto h-auto justify-start self-start whitespace-normal p-0 text-left"><a href={d.href} target="_blank" rel="noopener noreferrer">{d.action}<ArrowUpRight /></a></Button>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Sumber: situs pengelola dan pemerintah pada tautan di atas. Bukan daftar tempat terdekat atau status buka saat ini. Jadwal, biaya, dan penerimaan perlu dikonfirmasi langsung.</p>
    </section>
  );
}