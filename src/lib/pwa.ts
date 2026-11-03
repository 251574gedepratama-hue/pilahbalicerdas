// Registers the service worker that makes PilahIn Bali installable (PWA) and
// able to open offline. Dev/preview runs are skipped so the editor always
// serves the freshest build instead of a cached one.
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  const register = () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* offline support is optional; the app still works without it */
    });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

export function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  const iOSStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return window.matchMedia("(display-mode: standalone)").matches || iOSStandalone;
}
