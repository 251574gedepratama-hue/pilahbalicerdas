import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// Sumber: SIPSN KLHK tahun 2024 (dikutip Bali Post, 9 Agustus 2025), ton per tahun.
const REGENCY_2024 = [
  { name: "Denpasar", ton: 366807 },
  { name: "Gianyar", ton: 205130 },
  { name: "Badung", ton: 199810 },
  { name: "Buleleng", ton: 150780 },
  { name: "Karangasem", ton: 102643 },
  { name: "Tabanan", ton: 86571 },
  { name: "Jembrana", ton: 60107 },
  { name: "Bangli", ton: 41558 },
  { name: "Klungkung", ton: 40829 },
].map((r) => ({ ...r, perHari: Math.round(r.ton / 365) }));

// Total provinsi (ton per hari) dari sumber yang berbeda.
const TREND = [
  { year: "2019", perHari: 4281, source: "Riset Bali Partnership (Mongabay)" },
  { year: "2023", perHari: 3367, source: "SIPSN, disampaikan Pemprov Bali" },
  { year: "2024", perHari: 3436, source: "SIPSN (Bali Post)" },
];

const config = { perHari: { label: "Ton per hari", color: "var(--color-primary)" } } satisfies ChartConfig;
const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

export function BaliWasteData() {
  return (
    <section id="data-bali" className="border-t border-border py-12 md:py-16">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary"><BarChart3 className="size-4" /> DATA NYATA SAMPAH BALI</p>
      <h2 className="text-3xl font-extrabold">Bali menghasilkan ±3.436 ton sampah setiap hari</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">Data resmi tahun 2024 menunjukkan Denpasar sebagai penyumbang sampah terbesar. Sekitar 65% sampah Bali adalah sampah organik, dan 64% berasal dari rumah tangga.</p>
      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div className="min-w-0">
          <h3 className="font-bold">Sampah per kabupaten/kota, 2024 (ton/hari)</h3>
          <ChartContainer config={config} className="mt-4 h-80 w-full">
            <BarChart data={REGENCY_2024} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="perHari" fill="var(--color-perHari)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold">Perbandingan total Bali dari tahun ke tahun</h3>
          <ul className="mt-4 space-y-3">
            {TREND.map((t) => (
              <li key={t.year} className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
                <span><span className="font-bold">{t.year}</span> <span className="text-xs text-muted-foreground">· {t.source}</span></span>
                <span className="font-bold">{fmt(t.perHari)} ton/hari</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">Data resmi per kabupaten dari 20 tahun lalu (±2004) belum tersedia secara terbuka. Angka 2019 berasal dari metode riset yang berbeda, jadi perbandingannya bersifat gambaran umum.</p>
          <p className="mt-3 text-xs text-muted-foreground">Sumber: <a className="underline" href="https://www.balipost.com/news/2025/08/09/479169/Timbulan-Sampah-di-Bali-Capai...html" target="_blank" rel="noopener noreferrer">Bali Post (SIPSN 2024)</a>, <a className="underline" href="https://bmc.baliprov.go.id/news/title/keberhasilan-pengelolaan-sampah-perlu-komitmen-dan-dukungan-dari-seluruh-elemen-masyarakat" target="_blank" rel="noopener noreferrer">Pemprov Bali</a>, <a className="underline" href="https://mongabay.co.id/2019/07/02/inilah-data-dan-sumber-sampah-terbaru-di-bali/" target="_blank" rel="noopener noreferrer">Mongabay</a>.</p>
        </div>
      </div>
    </section>
  );
}
