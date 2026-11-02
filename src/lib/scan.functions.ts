import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const scanWaste = createServerFn({ method: "POST" })
  .inputValidator(z.object({ image: z.string().startsWith("data:image/").max(8_000_000) }))
  .handler(async ({ data }) => {
    const { analyzeWasteImage } = await import("./ai/scan.server");
    return analyzeWasteImage(data.image);
  });
