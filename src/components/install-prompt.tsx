import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStandaloneApp } from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pilahin-install-dismissed";

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandaloneApp()) {
      setInstalled(true);
      return;
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!installEvent) {
      setShowIosHint(true);
      try {
        localStorage.setItem(DISMISS_KEY, "ios");
      } catch {
        /* private mode */
      }
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={install}
        aria-label="Pasang Pilah Cerdas Bali ke layar utama HP"
        className="h-9 gap-2 rounded-full border-primary/30 bg-card px-3 text-xs font-bold text-primary"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Pasang aplikasi</span>
      </Button>

      {showIosHint && (
        <div className="absolute right-4 z-40 mt-2 w-64 rounded-2xl border border-border bg-card p-4 text-sm shadow-soft">
          <button
            type="button"
            onClick={() => setShowIosHint(false)}
            aria-label="Tutup keterangan"
            className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="flex items-center gap-2 font-bold text-foreground">
            <Smartphone className="h-4 w-4 text-primary" /> Pasang di iPhone
          </p>
          <p className="mt-2 text-muted-foreground">
            Ketuk tombol <strong>Bagikan</strong> di bawah Safari, lalu pilih{" "}
            <strong>Tambahkan ke Layar Utama</strong>.
          </p>
        </div>
      )}
    </>
  );
}
