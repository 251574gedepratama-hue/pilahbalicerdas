import { useState } from "react";
import { ArrowUpRight, MapPin, Navigation, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = "organik" | "anorganik" | "b3" | "residu";

const INFO: Record<Category, { label: string; bin: string; what: string; examples: string[]; tip: string; search: string }> = {
  organik: { label: "Organik", bin: "Tong hijau", what: "Sampah dari makhluk hidup yang bisa membusuk dan diolah menjadi kompos atau pakan maggot.", examples: ["Sisa canang & bunga upakara", "Sisa makanan dan kulit buah", "Daun, ranting, janur", "Ampas kopi dan teh"], tip: "Pisahkan dari plastik. Bisa dikomposkan sendiri di teba modern atau lubang biopori.", search: "TPS3R kompos" },
  anorganik: { label: "Anorganik", bin: "Tong kuning", what: "Sampah yang sulit membusuk tetapi masih bisa didaur ulang dan punya nilai jual di bank sampah.", examples: ["Botol & gelas plastik", "Kardus dan kertas", "Kaleng minuman", "Botol kaca"], tip: "Bilas, keringkan, dan pipihkan agar diterima bank sampah dan harganya lebih baik.", search: "bank sampah" },
  b3: { label: "B3", bin: "Tong merah", what: "Bahan Berbahaya dan Beracun yang bisa mencemari tanah, air, dan membahayakan kesehatan.", examples: ["Baterai bekas", "Lampu neon / LED", "Obat kedaluwarsa", "Elektronik rusak, kaleng pestisida"], tip: "Simpan terpisah dalam wadah tertutup. Jangan dibakar atau dibongkar; minta arahan DLH.", search: "dinas lingkungan hidup" },
  residu: { label: "Residu", bin: "Tong abu-abu", what: "Sampah yang tidak bisa dikomposkan maupun didaur ulang, sehingga berakhir di TPA.", examples: ["Popok & pembalut bekas", "Bungkus sachet berlapis", "Puntung rokok, permen karet", "Styrofoam kotor"], tip: "Cara terbaik adalah mengurangi dari sumbernya: pilih isi ulang dan wadah sendiri.", search: "TPS sampah" },
};

const REGIONS = ["Denpasar", "Badung", "Gianyar", "Tabanan", "Klungkung", "Bangli", "Karangasem", "Buleleng", "Jembrana"] as const;

const destinations: { name: string; area: string; categories: Category[]; description: string; href: string; action: string }[] = [
  { name: "Bank Sampah Vijasukma", area: "Pedungan, Denpasar Selatan", categories: ["anorganik"], description: "Menangani plastik, kertas, kaca, botol, dan minyak jelantah. Tanyakan jenis yang diterima terlebih dahulu.", href: "https://banksampahvijasukma.com/", action: "Cek informasi & kontak" },
  { name: "Temesi Recycling", area: "Temesi, Gianyar", categories: ["organik", "anorganik"], description: "Mengolah sampah organik menjadi kompos dan mendaur ulang anorganik. Hubungi pengelola untuk memastikan layanan.", href: "https://temesirecycling.com/contact-us/", action: "Hubungi pengelola" },
  { name: "DLH Kabupaten Buleleng", area: "Buleleng · konsultasi B3", categories: ["b3"], description: "Minta arahan untuk baterai, elektronik, dan limbah berbahaya rumah tangga. Kontak panduan, bukan titik setor umum.", href: "https://dlh.bulelengkab.go.id/informasi/detail/artikel/12_limbah-baterai-berbahaya-jangan-buang-sembarang", action: "Lihat panduan & kontak" },
  { name: "Informasi persampahan Denpasar", area: "Kota Denpasar · direktori resmi", categories: ["organik", "anorganik", "residu"], description: "Informasi TPS3R dan bank sampah dari pemerintah kota. Untuk residu, tanyakan layanan pengangkutan setempat.", href: "https://denpasarkota.go.id/page/informasi-pengelolaan-sampah", action: "Buka direktori resmi" },
];

const mapsUrl = (q: string) => `https://www.google.com/maps/search/${encodeURIComponent(q)}`;

export function WasteDestinations({ category }: { category?: Category | undefined }) {
  const [active, setActive] = useState<Category>(category ?? "organik");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("Denpasar");
  const info = INFO[active];
  return (
    <section id="tempat" className="border-t border-border py-12 md:py-16">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary"><MapPin className="size-4" /> KENALI LALU SALURKAN</p>
      <h2 className="text-3xl font-extrabold">Pahami jenisnya, lalu temukan tempatnya</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">Pilih jenis sampah untuk melihat penjelasan, contoh, dan tempat penyaluran di seluruh Bali.</p>
      <div className="my-6 flex flex-wrap gap-2" role="tablist" aria-label="Jenis sampah">
        {(Object.keys(INFO) as Category[]).map((c) => <Button key={c} role="tab" aria-selected={active === c} variant={active === c ? "default" : "outline"} onClick={() => setActive(c)}>{INFO[c].label}</Button>)}
      </div>

      <div className="grid gap-6 rounded-lg border border-border bg-card p-5 md:grid-cols-2 md:p-7">
        <div>
          <p className="text-sm font-bold text-primary">{info.bin}</p>
          <h3 className="mt-1 text-2xl font-extrabold">Apa itu sampah {info.label.toLowerCase()}?</h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">{info.what}</p>
          <p className="mt-4 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">💡 {info.tip}</p>
        </div>
        <div>
          <h4 className="font-bold">Contoh</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">{info.examples.map((e) => <li key={e} className="rounded-md bg-muted px-3 py-2 text-sm">{e}</li>)}</ul>
        </div>
      </div>
      {active === "b3" && <p className="mt-4 flex items-start gap-2 text-sm text-destructive"><ShieldAlert className="size-5 shrink-0" /> Pisahkan limbah B3 dari sampah biasa. Jangan membongkar atau membakarnya.</p>}

      <h3 className="mt-8 text-xl font-bold">Lokasi terdekat</h3>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button asChild><a href={mapsUrl(`${info.search} terdekat`)} target="_blank" rel="noopener noreferrer"><Navigation /> Cari {info.label.toLowerCase()} terdekat dariku</a></Button>
      </div>
      <h3 className="mt-8 text-xl font-bold">Seluruh Bali</h3>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Kabupaten/kota">
        {REGIONS.map((r) => <Button key={r} size="sm" variant={region === r ? "secondary" : "ghost"} aria-pressed={region === r} onClick={() => setRegion(r)}>{r}</Button>)}
      </div>
      <Button asChild variant="link" className="mt-2 h-auto p-0"><a href={mapsUrl(`${info.search} ${region} Bali`)} target="_blank" rel="noopener noreferrer">Lihat tempat {info.label.toLowerCase()} di {region} pada peta <ArrowUpRight /></a></Button>

      <h3 className="mt-8 text-xl font-bold">Rekomendasi terverifikasi</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {destinations.filter((d) => d.categories.includes(active)).map((d) => (
          <article key={d.name} className="flex flex-col rounded-lg border border-border bg-card p-5">
            <p className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="size-4 shrink-0" />{d.area}</p>
            <h4 className="mt-3 text-lg font-bold">{d.name}</h4>
            <p className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
            <Button asChild variant="link" className="mt-auto h-auto justify-start self-start whitespace-normal p-0 text-left"><a href={d.href} target="_blank" rel="noopener noreferrer">{d.action}<ArrowUpRight /></a></Button>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Pencarian peta dibuka di Google Maps. Jadwal, biaya, dan jenis yang diterima perlu dikonfirmasi langsung ke pengelola.</p>
    </section>
  );
}
