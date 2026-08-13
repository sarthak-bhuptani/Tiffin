import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is already installed in standalone mode, hide prompt
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt && !isIOS) return null;

  return (
    <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-3xl p-4 shadow-lg border border-orange-400/30 flex items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        <div className="min-w-0">
          <h4 className="font-extrabold text-sm leading-tight truncate">
            📲 મોબાઇલમાં એપ ઇન્સ્ટોલ કરો (Install App)
          </h4>
          <p className="text-[11px] text-orange-100 font-medium truncate mt-0.5">
            {isIOS
              ? "iPhone પર: Share બટન દબાવીને 'Add to Home Screen' પસંદ કરો."
              : 'હોમ સ્ક્રીન પરથી WhatsApp ની જેમ સીધી ચાલુ કરો!'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {!isIOS && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="py-2 px-3 rounded-xl bg-white text-orange-700 font-extrabold text-xs shadow-md hover:bg-orange-50 transition active:scale-95 flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ઇન્સ્ટોલ કરો</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowPrompt(false)}
          className="p-1 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
