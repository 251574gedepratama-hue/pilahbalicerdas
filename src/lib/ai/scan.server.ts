import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

export const scanSchema = z.object({
  isWaste: z.boolean(),
  itemName: z.string(),
  category: z.enum(["organik", "anorganik", "b3", "residu"]),
  material: z.string(),
  binColor: z.string(),
  disposal: z.array(z.string()),
  recycleIdeas: z.array(z.string()),
  decomposeTime: z.string(),
  bankSampahValue: z.string(),
  funFact: z.string(),
  ecoPoints: z.number(),
});

export type ScanResult = z.infer<typeof scanSchema>;

const INSTRUCTIONS = `Kamu adalah asisten pemilah sampah untuk warga Indonesia. Analisis foto yang dikirim.
Jawab dalam Bahasa Indonesia yang ramah dan singkat.
- isWaste: false jika foto bukan sampah/benda buangan (isi field lain seadanya).
- category: organik (sisa makanan, daun), anorganik (plastik, kertas, logam, kaca yang bisa didaur ulang), b3 (baterai, lampu, obat, elektronik, bahan kimia), residu (popok, puntung, styrofoam kotor, sachet multilayer).
- binColor: warna tempat sampah standar Indonesia (hijau=organik, kuning=anorganik, merah=B3, abu-abu=residu).
- disposal: 3-4 langkah pembuangan yang benar.
- recycleIdeas: 2-3 ide daur ulang/guna ulang kreatif di rumah.
- decomposeTime: perkiraan waktu terurai di alam.
- bankSampahValue: perkiraan harga jual di bank sampah per kg dalam Rupiah, atau "Tidak laku dijual".
- funFact: satu fakta menarik tentang dampak sampah ini.
- ecoPoints: 5-30, lebih tinggi untuk sampah yang dampaknya besar bila dipilah benar.`;

export async function analyzeWasteImage(imageDataUrl: string): Promise<ScanResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Kunci AI belum dikonfigurasi.");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: INSTRUCTIONS,
    output: Output.object({ schema: scanSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Sampah apa ini dan bagaimana cara membuangnya?" },
          { type: "image", image: new URL(imageDataUrl) },
        ],
      },
    ],
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  try {
    const out = await result.output;
    return { ...out, ecoPoints: Math.max(5, Math.min(30, Math.round(out.ecoPoints))) };
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e)) throw new Error("AI tidak bisa membaca foto ini. Coba foto lain.");
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 402) throw new Error("Kuota AI habis. Tambahkan kredit untuk melanjutkan.");
    if (status === 429) throw new Error("Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.");
    throw e;
  }
}
