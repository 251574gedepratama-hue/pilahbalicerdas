import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Image as ImageIcon, Leaf, Loader2, RotateCcw, Sparkles, Recycle, Clock, Coins, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImpactSimulator } from "@/components/impact-simulator";
import { BaliWasteData } from "@/components/bali-waste-data";
import { WasteDestinations } from "@/components/waste-destinations";
import { InstallPrompt } from "@/components/install-prompt";
import { scanWaste } from "@/lib/scan.functions";
import heroImg from "@/assets/bali-hero.jpg";
import logo from "@/assets/pilah-cerdas-logo.png.asset.json";
import type { ScanResult } from "@/lib/ai/scan.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pilah Cerdas Bali — Foto Sampah, AI Bantu Memilah" },
      { name: "description", content: "Foto sampahmu, AI langsung memberi tahu jenisnya, tempat sampah yang tepat, dan ide daur ulangnya." },
      { property: "og:title", content: "Pilah Cerdas Bali — Foto Sampah, AI Bantu Memilah" },
      { property: "og:description", content: "Pemilah sampah pintar berbasis AI untuk warga Indonesia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CAT = {
  organik: { label: "Organik", cls: "bg-bin-organik text-primary-foreground" },
  anorganik: { label: "Anorganik", cls: "bg-bin-anorganik text-foreground" },
  b3: { label: "B3 (Berbahaya)", cls: "bg-bin-b3 text-destructive-foreground" },
  residu: { label: "Residu", cls: "bg-bin-residu text-primary-foreground" },
} as const;

type HistoryItem = { name: string; category: ScanResult["category"]; points: number; at: number };

async function compress(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = img.width * scale;
  c.height = img.height * scale;
  const context = c.getContext("2d");
  if (!context) throw new Error("Foto belum bisa diproses. Coba lagi.");
  context.drawImage(img, 0, 0, c.width, c.height);
  img.close();
  return c.toDataURL("image/jpeg", 0.82);
}

function Index() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("pilahin-history") || "[]")); } catch { /* empty */ }
  }, []);

  const totalPoints = history.reduce((s, h) => s + h.points, 0);

  async function onFile(file?: File) {
    if (!file) return;
    setError(null); setResult(null); setLoading(true);
    try {
      const data = await compress(file);
      setPreview(data);
      const r = await scanWaste({ data: { image: data } });
      setResult(r);
      if (r.isWaste) {
        const next = [{ name: r.itemName, category: r.category, points: r.ecoPoints, at: Date.now() }, ...history].slice(0, 20);
        setHistory(next);
        localStorage.setItem("pilahin-history", JSON.stringify(next));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function reset() { setPreview(null); setResult(null); setError(null); }

  return (
    <div className="min-h-screen">
      <header className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-5">
        <img src={logo.url} alt="Pilah Cerdas Bali" width={150} height={100} className="h-14 w-auto rounded-md md:h-16" />
        <div className="flex items-center gap-2">
          <InstallPrompt />
          <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
            <Sparkles className="h-4 w-4 text-accent" /> {totalPoints} Poin · {level(totalPoints)}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        {!preview && (
          <>
          <section className="bali-intro relative -mx-5 isolate overflow-hidden px-5 py-12 md:py-16">
            <img src={heroImg} alt="Pemuda Bali memotret botol plastik di depan candi bentar dan tong pilah" width={1024} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
            <div className="intro-shade absolute inset-0 -z-10" />
            <div className="max-w-lg">
              <p className="mb-3 text-sm font-bold text-primary">Om Swastiastu 🙏 · Bersama jaga Bali</p>
              <h1 className="text-5xl font-extrabold leading-tight text-foreground md:text-6xl">
                Pilah Cerdas Bali
              </h1>
              <p className="mt-4 text-2xl font-bold leading-snug">Bali bersih dimulai dari satu pilahanmu.</p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">
                Punya sisa canang, bungkus makanan, atau botol plastik? Foto sampahmu, kenali jenisnya, lalu temukan cara penanganan yang tepat.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="h-auto whitespace-normal px-6 py-4 text-base font-bold shadow-soft">
                  <label htmlFor="foto-kamera"><Camera className="h-5 w-5" /> Ambil foto sampah</label>
                </Button>
                <Button asChild variant="secondary" size="lg" className="h-auto whitespace-normal px-6 py-4 text-base font-bold">
                  <label htmlFor="foto-galeri"><ImageIcon className="h-5 w-5" /> Pilih dari galeri</label>
                </Button>
                <span className="text-sm text-foreground">Tanpa daftar</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
                <Button asChild variant="link" className="h-auto p-0"><a href="#dampak">Lihat dampaknya <ArrowDown /></a></Button>
                <Button asChild variant="link" className="h-auto p-0"><a href="#tempat">Temukan tempat penyaluran <ArrowDown /></a></Button>
              </div>
            </div>
          </section>

          <section className="-mx-5 border-y-4 border-foreground bg-primary px-5 py-7 text-primary-foreground md:px-10">
            <p className="text-sm font-bold">Tri Hita Karana</p>
            <h2 className="mt-2 max-w-3xl text-xl font-bold leading-relaxed md:text-2xl">Merawat alam, menjaga sesama, menghormati Sang Pencipta. Mulai dari sampah yang kita hasilkan hari ini.</h2>
          </section>
          </>
        )}

        <input id="foto-kamera" type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <input id="foto-galeri" type="file" accept="image/*" className="hidden"
          onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />

        {preview && (
          <section className="grid gap-6 py-6 md:grid-cols-[2fr_3fr]">
            <div className="relative self-start overflow-hidden rounded-[2rem] bg-card shadow-soft">
              <img src={preview} alt="Foto sampah" className="aspect-square w-full object-cover" />
              {loading && (
                <>
                  <div className="absolute inset-0 bg-primary/20" />
                  <div className="scan-line absolute left-0 right-0 h-1 bg-accent shadow-soft" />
                </>
              )}
            </div>

            <div className="rounded-[2rem] bg-card p-6 shadow-soft md:p-8">
              {loading && (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" /> AI sedang mengenali sampahmu…
                </div>
              )}
              {error && (
                <div className="py-10 text-center">
                  <p className="font-bold text-destructive">{error}</p>
                  <Button onClick={reset} variant="secondary" className="mt-4">Coba lagi</Button>
                </div>
              )}
              {result && !result.isWaste && (
                <div className="py-10 text-center">
                  <p className="text-lg font-bold">Sepertinya ini bukan sampah 🤔</p>
                  <p className="mt-1 text-muted-foreground">Coba foto benda yang ingin kamu buang.</p>
                  <Button onClick={reset} variant="secondary" className="mt-4">Foto lagi</Button>
                </div>
              )}
              {result && result.isWaste && (
                <div>
                  <span className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${CAT[result.category].cls}`}>
                    {CAT[result.category].label} · Tong {result.binColor}
                  </span>
                  <h2 className="mt-3 text-3xl font-extrabold">{result.itemName}</h2>
                  <p className="text-muted-foreground">{result.material}</p>

                  <div className="mt-5 rounded-2xl bg-muted p-4">
                    <div className="flex justify-between text-sm"><span className="font-bold">Tingkat keyakinan AI</span><span className="font-bold text-primary">{result.confidence}%</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className="grow-bar h-full rounded-full bg-primary" style={{ width: `${result.confidence}%` }} /></div>
                    <p className="mt-3 text-sm font-bold">Jumlah objek terdeteksi: {result.objectCount} buah</p>
                    {result.objects.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {result.objects.map((o, i) => (
                          <li key={i} className="flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs"><span className={`h-2.5 w-2.5 rounded-full ${CAT[o.category].cls}`} />{o.count}× {o.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                    <Stat icon={<Clock className="h-4 w-4" />} label="Terurai" value={result.decomposeTime} />
                    <Stat icon={<Coins className="h-4 w-4" />} label="Bank sampah" value={result.bankSampahValue} />
                    <Stat icon={<Sparkles className="h-4 w-4" />} label="Poin" value={`+${result.ecoPoints}`} />
                  </div>

                  <h3 className="mt-6 font-bold">Cara membuang</h3>
                  <ol className="mt-2 space-y-2">
                    {result.disposal.map((d, i) => (
                      <li key={i} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>{d}</li>
                    ))}
                  </ol>

                  <h3 className="mt-6 flex items-center gap-2 font-bold"><Recycle className="h-4 w-4 text-primary" /> Ide daur ulang</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">{result.recycleIdeas.map((d, i) => <li key={i}>{d}</li>)}</ul>

                  <p className="mt-6 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">💡 {result.funFact}</p>

                  <Button asChild className="mt-6 h-auto px-6 py-3 font-bold">
                    <label htmlFor="foto-kamera"><RotateCcw className="h-4 w-4" /> Pindai sampah lain</label>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        <BaliWasteData />
        <ImpactSimulator />
        <WasteDestinations key={result?.category ?? "semua"} category={result?.isWaste ? result.category : undefined} />

        {history.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold">Riwayat pilahanmu</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {history.map((h) => (
                <div key={h.at} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${CAT[h.category].cls}`} />
                    <span className="font-medium">{h.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">+{h.points}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function level(p: number) {
  if (p >= 300) return "Penjaga Pulau 🏝️";
  if (p >= 150) return "Pahlawan Banjar 🛕";
  if (p >= 50) return "Sahabat Subak 🌾";
  return "Pemula 🌱";
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-bold leading-tight">{value}</div>
    </div>
  );
}
