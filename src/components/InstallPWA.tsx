"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(installEvent);
    };
    
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        setIsDismissed(true);
      }
    });
  };

  if (!supportsPWA || isDismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-surface border border-accent/30 rounded-2xl p-4 shadow-lg shadow-accent/10 z-50 animate-in slide-in-from-bottom-10 fade-in flex items-center gap-3">
       <div className="bg-accent/20 p-2 text-accent rounded-xl shrink-0">
         <Download size={24} />
       </div>
       <div className="flex-1">
         <div className="font-bold text-sm">Install App</div>
         <div className="text-[11px] text-muted leading-tight">Add to Home Screen for the best experience.</div>
       </div>
       <button aria-label="Install FinanceKaro app" onClick={onClick} className="bg-accent text-white font-bold text-xs px-4 py-2 rounded-lg hover:scale-105 transition-transform">
         Get App
       </button>
       <button aria-label="Dismiss install prompt" onClick={() => setIsDismissed(true)} className="absolute -top-2 -right-2 bg-surface2 text-muted p-1 border border-border rounded-full hover:text-text">
         <X size={12} />
       </button>
    </div>
  );
}
