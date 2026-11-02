import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Leaf, Loader2, RotateCcw, Sparkles, Recycle, Clock, Coins, Upload } from "lucide-react";
import { scanWaste } from "@/lib/scan.functions";
import type { ScanResult } from "@/lib/ai/scan.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PilahIn — Foto Sampah, AI Bantu Memilah" },
      { name: "description", content: "Foto sampahmu, AI langsung memberi tahu jenisnya, tempat sampah yang tepat, dan ide daur ulangnya." },
      { property: "og:title", content: "PilahIn — Foto Sampah, AI Bantu Memilah" },
      { property: "og:description", content: "Pemilah sampah pintar berbasis AI untuk warga Indonesia." },
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
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
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
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 font-display text-xl font-extrabold text-primary">
          <Leaf className="h-6 w-6" /> PilahIn
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
          <Sparkles className="h-4 w-4 text-accent" /> {totalPoints} Poin Hijau
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        {!preview && (
          <section className="grid items-center gap-10 py-8 md:grid-cols-2 md:py-16">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">Pemilah sampah pintar</p>
              <h1 className="text-5xl font-extrabold leading-[1.05] text-foreground md:text-6xl">
                Bingung buang ke mana? <span className="text-primary">Foto saja.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                AI mengenali sampahmu dalam hitungan detik, memberi tahu tempat sampah yang tepat, dan ide daur ulangnya.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-leaf px-7 py-4 font-bold text-primary-foreground shadow-soft transition hover:scale-[1.03]">
                  <Camera className="h-5 w-5" /> Foto Sampah
                </button>
              </div>
            </div>
            <button onClick={() => inputRef.current?.click()} className="group grid aspect-square place-items-center rounded-[2rem] border-2 border-dashed border-primary/40 bg-card shadow-soft transition hover:border-primary">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-primary transition group-hover:-translate-y-1" />
                <p className="mt-3 font-bold">Unggah atau ambil foto</p>
                <div className="mt-6 flex justify-center gap-2">
                  {Object.values(CAT).map((c) => (
                    <span key={c.label} className={`h-8 w-8 rounded-lg ${c.cls}`} title={c.label} />
                  ))}
                </div>
              </div>
            </button>
          </section>
        )}

        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
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
                  <button onClick={reset} className="mt-4 rounded-full bg-secondary px-5 py-2 font-bold">Coba lagi</button>
                </div>
              )}
              {result && !result.isWaste && (
                <div className="py-10 text-center">
                  <p className="text-lg font-bold">Sepertinya ini bukan sampah 🤔</p>
                  <p className="mt-1 text-muted-foreground">Coba foto benda yang ingin kamu buang.</p>
                  <button onClick={reset} className="mt-4 rounded-full bg-secondary px-5 py-2 font-bold">Foto lagi</button>
                </div>
              )}
              {result && result.isWaste && (
                <div>
                  <span className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${CAT[result.category].cls}`}>
                    {CAT[result.category].label} · Tong {result.binColor}
                  </span>
                  <h2 className="mt-3 text-3xl font-extrabold">{result.itemName}</h2>
                  <p className="text-muted-foreground">{result.material}</p>

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

                  <button onClick={() => inputRef.current?.click()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 font-bold text-primary-foreground">
                    <RotateCcw className="h-4 w-4" /> Pindai sampah lain
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-bold leading-tight">{value}</div>
    </div>
  );
}
