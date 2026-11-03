import { useState } from "react";
import { ArrowDown, Leaf, Recycle, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { calculateImpact } from "@/lib/impact";

const formatKg = (n: number) => `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n)} kg`;

export function ImpactSimulator() {
  const [daily, setDaily] = useState(1);
  const [percent, setPercent] = useState(60);
  const [days, setDays] = useState(30);
  const impact = calculateImpact(daily, percent, days);

  return (
    <section id="dampak" className="border-t border-border py-12 md:py-16">
      <div className="mb-8 flex items-center gap-2 text-sm font-bold text-primary"><Leaf className="size-4" /> DAMPAK PILAHANMU</div>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold">Sedikit setiap hari.<br />Berarti untuk Bali.</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">Sisa canang dan makanan bisa menjadi kompos. Plastik, kertas, dan logam yang diterima pengolah bisa kembali bernilai. Semakin banyak yang benar-benar diolah, semakin sedikit yang menuju TPA.</p>
          <div className="mt-7 flex items-start gap-3 border-l-4 border-primary pl-4">
            <Recycle className="mt-1 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed">Memilah adalah awal. Dampaknya baru terjadi ketika sampah digunakan kembali, dikomposkan, atau disalurkan ke pengolah yang sesuai.</p>
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
            <div className="flex items-center gap-2" role="group" aria-label="Periode simulasi">
              {[7, 30, 365].map((d) => <Button key={d} variant={days === d ? "default" : "outline"} aria-pressed={days === d} onClick={() => setDays(d)}>{d === 7 ? "7 hari" : d === 30 ? "30 hari" : "1 tahun"}</Button>)}
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4" aria-live="polite">
            <div className="rounded-lg bg-secondary p-4"><ArrowDown className="mb-2 size-5 text-primary" /><p className="text-3xl font-extrabold text-primary">{formatKg(impact.divertedKg)}</p><p className="mt-1 text-sm">Berpotensi tidak ke TPA</p></div>
            <div className="rounded-lg bg-muted p-4"><Trash2 className="mb-2 size-5 text-muted-foreground" /><p className="text-3xl font-extrabold">{formatKg(impact.remainingKg)}</p><p className="mt-1 text-sm text-muted-foreground">Masih perlu penanganan</p></div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Ilustrasi, bukan dampak terukur. Dari total {formatKg(impact.totalKg)}, hasil = sampah per hari × jumlah hari × porsi yang benar-benar diolah. Tidak menghitung emisi atau menjamin semua sampah diterima pengolah.</p>
        </div>
      </div>
    </section>
  );
}