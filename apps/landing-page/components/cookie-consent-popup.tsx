"use client";

import { useEffect, useState } from "react";
import { Shield, Settings, X } from "lucide-react";
import CookieSettingsModal from "./cookie-setting-modal";

export default function CookieConsentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  const handleSettings = () => {
    setShowCookieSettings(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8 sm:pr-12">
          {/* Content */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Kami menggunakan cookie
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas, dan menampilkan iklan yang relevan. 
                <a href="/cookie-policy" className="text-blue-600 hover:text-blue-700 underline ml-1">
                  Pelajari lebih lanjut
                </a>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-2 w-full sm:w-auto items-center">
            <button
              onClick={handleSettings}
              className="flex-1 sm:w-auto px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Atur Cookie
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:w-auto px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
            >
              Terima Semua
            </button>
          </div>
        </div>
        
        {/* Close button positioned at the far right */}
        <button
          onClick={handleDecline}
          className="absolute top-3 right-4 sm:top-4 sm:right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <CookieSettingsModal
        isOpen={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
        closeConsent={() => setIsVisible(false)}
      />
    </div>
  );
}
