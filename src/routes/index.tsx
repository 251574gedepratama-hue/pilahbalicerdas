import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Leaf, Loader2, RotateCcw, Sparkles, Recycle, Clock, Coins, Upload } from "lucide-react";
import { scanWaste } from "@/lib/scan.functions";
import heroImg from "@/assets/bali-hero.jpg";
import type { ScanResult } from "@/lib/ai/scan.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PilahIn Bali — Foto Sampah, AI Bantu Memilah" },
      { name: "description", content: "Foto sampahmu, AI langsung memberi tahu jenisnya, tempat sampah yang tepat, dan ide daur ulangnya." },
      { property: "og:title", content: "PilahIn Bali — Foto Sampah, AI Bantu Memilah" },
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
          <Leaf className="h-6 w-6" /> PilahIn <span className="text-gold">Bali</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
          <Sparkles className="h-4 w-4 text-accent" /> {totalPoints} Poin · {level(totalPoints)}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        {!preview && (
          <>
          <section className="grid items-center gap-10 py-6 md:grid-cols-2 md:py-12">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">Om Swastiastu 🙏 · Jaga Bali tetap asri</p>
              <h1 className="text-5xl font-extrabold leading-[1.05] text-foreground md:text-6xl">
                Bingung buang ke mana? <span className="text-primary">Foto saja.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                Dari canang sisa upacara sampai botol plastik di pantai, AI kami kenali sampahmu dalam hitungan detik dan memberi tahu tong yang tepat.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-leaf px-7 py-4 font-bold text-primary-foreground shadow-soft transition hover:scale-[1.03]">
                  <Camera className="h-5 w-5" /> Foto Sampah Sekarang
                </button>
                <span className="text-sm text-muted-foreground">Gratis · tanpa daftar · 5 detik</span>
              </div>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
                {[["±4.200", "ton sampah/hari di Bali"], ["60%", "sampah itu organik"], ["4", "warna tong pilah"]].map(([n, l]) => (
                  <div key={l} className="rounded-2xl bg-card p-3 shadow-soft">
                    <div className="font-display text-2xl font-extrabold text-primary">{n}</div>
                    <div className="text-xs text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.5rem] bg-poleng opacity-90" />
              <button onClick={() => inputRef.current?.click()} className="relative block overflow-hidden rounded-[2rem] shadow-soft">
                <img src={heroImg} alt="Pemuda Bali memotret botol plastik di depan candi bentar dan tong pilah" width={1024} height={1024} className="aspect-square w-full object-cover" />
              </button>
              <span className="float-slow absolute -left-4 -top-4 text-5xl">🌺</span>
              <div className="absolute -bottom-5 right-5 flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold shadow-soft">
                <Recycle className="h-4 w-4 text-primary" /> Botol plastik → Tong Kuning
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] bg-leaf bg-songket p-8 text-primary-foreground md:p-12">
            <p className="text-sm font-bold uppercase tracking-widest text-gold">Tri Hita Karana</p>
            <h2 className="mt-2 max-w-xl text-3xl font-extrabold md:text-4xl">Memilah sampah adalah wujud harmoni dengan alam, sesama, dan Sang Pencipta.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[["📸", "Foto", "Arahkan kamera ke sampah apa saja."], ["🤖", "AI mengenali", "Jenis, tong, cara buang, dan nilai jualnya."], ["🌿", "Kumpulkan poin", "Naik level dari Pemula sampai Penjaga Pulau."]].map(([e, t, d], i) => (
                <div key={t} className="rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur">
                  <div className="text-3xl">{e}</div>
                  <div className="mt-2 font-display text-lg font-bold">{i + 1}. {t}</div>
                  <p className="text-sm opacity-85">{d}</p>
                </div>
              ))}
            </div>
          </section>
          </>
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
