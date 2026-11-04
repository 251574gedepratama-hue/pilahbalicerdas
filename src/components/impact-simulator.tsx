import { useState } from "react";
import { ArrowDown, Leaf, Recycle, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { calculateImpact, splitByType, DEFAULT_COMPOSITION, PERIODS, type WasteType } from "@/lib/impact";

const formatKg = (n: number) => `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n)} kg`;
const TYPES: { key: WasteType; label: string }[] = [
  { key: "organik", label: "Organik" }, { key: "anorganik", label: "Anorganik" }, { key: "b3", label: "B3" }, { key: "residu", label: "Residu" },
];
const chartConfig = {
  organik: { label: "Organik", color: "var(--color-bin-organik)" },
  anorganik: { label: "Anorganik", color: "var(--color-bin-anorganik)" },
  b3: { label: "B3", color: "var(--color-bin-b3)" },
  residu: { label: "Residu", color: "var(--color-bin-residu)" },
} satisfies ChartConfig;

export function ImpactSimulator() {
  const [daily, setDaily] = useState(1);
  const [percent, setPercent] = useState(60);
  const [days, setDays] = useState(30);
  const [comp, setComp] = useState(DEFAULT_COMPOSITION);
  const impact = calculateImpact(daily, percent, days);
  const split = splitByType(daily, days, comp);
  const data = PERIODS.map((p) => ({ period: p.label, ...splitByType(daily, p.days, comp) }));

  return (
    <section id="dampak" className="border-t border-border py-12 md:py-16">
      <div className="mb-8 flex items-center gap-2 text-sm font-bold text-primary"><Leaf className="size-4" /> DAMPAK PILAHANMU</div>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold">Sedikit setiap hari.<br />Berarti untuk Bali.</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">Sisa canang dan makanan bisa menjadi kompos. Plastik, kertas, dan logam bisa kembali bernilai. Semakin banyak yang benar-benar diolah, semakin sedikit yang menuju TPA.</p>
          <div className="mt-7 flex items-start gap-3 border-l-4 border-primary pl-4">
            <Recycle className="mt-1 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed">Memilah adalah awal. Dampaknya baru terjadi ketika sampah dikomposkan, didaur ulang, atau disalurkan ke pengolah yang sesuai.</p>
          </div>
          <h3 className="mt-8 font-bold">Komposisi sampah rumahmu</h3>
          <div className="mt-4 space-y-5">
            {TYPES.map((t) => (
              <div key={t.key}>
                <div className="mb-3 flex justify-between text-sm"><label id={`c-${t.key}`} className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: chartConfig[t.key].color }} />{t.label}</label><span className="font-bold">{comp[t.key]}%</span></div>
                <Slider aria-labelledby={`c-${t.key}`} value={[comp[t.key]]} onValueChange={([v]) => setComp((c) => ({ ...c, [t.key]: v ?? 0 }))} min={0} max={100} step={1} />
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-bold">Simulasi sampah rumahmu</h3>
          <div className="mt-6 space-y-7">
            <div>
              <div className="mb-4 flex justify-between gap-3 text-sm"><label id="daily-label">Sampah per hari</label><span className="font-bold">{formatKg(daily)}</span></div>
              <Slider aria-labelledby="daily-label" value={[daily]} onValueChange={([v]) => setDaily(v ?? 1)} min={0.5} max={5} step={0.5} />
            </div>
            <div>
              <div className="mb-4 flex justify-between gap-3 text-sm"><label id="processed-label">Porsi yang berhasil diolah</label><span className="font-bold">{percent}%</span></div>
              <Slider aria-labelledby="processed-label" value={[percent]} onValueChange={([v]) => setPercent(v ?? 0)} min={0} max={100} step={10} />
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Periode simulasi">
              {PERIODS.map((p) => <Button key={p.days} size="sm" variant={days === p.days ? "default" : "outline"} aria-pressed={days === p.days} onClick={() => setDays(p.days)}>{p.label}</Button>)}
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4" aria-live="polite">
            <div className="rounded-lg bg-secondary p-4"><ArrowDown className="mb-2 size-5 text-primary" /><p className="text-2xl font-extrabold text-primary">{formatKg(impact.divertedKg)}</p><p className="mt-1 text-sm">Berpotensi tidak ke TPA</p></div>
            <div className="rounded-lg bg-muted p-4"><Trash2 className="mb-2 size-5 text-muted-foreground" /><p className="text-2xl font-extrabold">{formatKg(impact.remainingKg)}</p><p className="mt-1 text-sm text-muted-foreground">Masih perlu penanganan</p></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {TYPES.map((t) => <div key={t.key} className="rounded-md border border-border p-2"><p className="text-xs text-muted-foreground">{t.label}</p><p className="font-bold">{formatKg(split[t.key])}</p></div>)}
          </div>
          <h4 className="mt-7 font-bold">Total sampah per jenis: 1 hari sampai 1 tahun</h4>
          <ChartContainer config={chartConfig} className="mt-3 aspect-auto h-72 w-full">
            <BarChart data={data} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis scale="sqrt" tickLine={false} axisLine={false} fontSize={11} width={44} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v, n) => <span>{chartConfig[n as WasteType]?.label}: <b>{formatKg(Number(v))}</b></span>} />} />
              <ChartLegend content={<ChartLegendContent />} />
              {TYPES.map((t, i) => <Bar key={t.key} dataKey={t.key} stackId="a" fill={`var(--color-${t.key})`} radius={i === TYPES.length - 1 ? [4, 4, 0, 0] : 0} />)}
            </BarChart>
          </ChartContainer>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Ilustrasi, bukan dampak terukur. Dari total {formatKg(impact.totalKg)}, hasil = sampah per hari × jumlah hari × porsi yang benar-benar diolah. Komposisi awal adalah perkiraan yang bisa kamu ubah. Skala grafik dipadatkan agar 1 hari tetap terlihat.</p>
        </div>
      </div>
    </section>
  );
}
