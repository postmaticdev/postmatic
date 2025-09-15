"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, BarChart3, Megaphone } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieSettingsModal({
  
  isOpen,
  onClose,
  closeConsent,
}: {
  isOpen: boolean;
  onClose: () => void;
  closeConsent: () => void;
}) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // selalu aktif
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem("cookiePrefs");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, [isOpen]);
  const t = useTranslations("cookieSettings");

  const handleSave = () => {
    localStorage.setItem("cookiePrefs", JSON.stringify(preferences));
    localStorage.setItem("cookieConsent", "custom");
    onClose();
    closeConsent();
  };

  const handleRejectAll = () => {
    const rejected = { necessary: true, analytics: false, marketing: false };
    setPreferences(rejected);
    localStorage.setItem("cookiePrefs", JSON.stringify(rejected));
    localStorage.setItem("cookieConsent", "rejected");
    onClose();
    closeConsent();
  };

  if (!isOpen) return null;

  

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Necessary */}
          <CookieToggle
            icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
            title={t("cookieWajib")}
            description={t("cookieWajibDescription")}
            enabled={preferences.necessary}
            onToggle={() => {}} // tidak bisa dimatikan
            disabled
          />

          {/* Analytics */}
          <CookieToggle
            icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
            title={t("cookieAnalitik")}
            description={t("cookieAnalitikDescription")}
            enabled={preferences.analytics}
            onToggle={() =>
              setPreferences((prev) => ({ ...prev, analytics: !prev.analytics }))
            }
          />

          {/* Marketing */}
          <CookieToggle
            icon={<Megaphone className="w-6 h-6 text-purple-500" />}
            title={t("cookieIklan")}
            description={t("cookieIklanDescription")}
            enabled={preferences.marketing}
            onToggle={() =>
              setPreferences((prev) => ({ ...prev, marketing: !prev.marketing }))
            }
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {t("simpanDanTerima")}
          </button>
          <button
            onClick={handleRejectAll}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold py-3 rounded-xl transition"
          >
            {t("tolakSemua")}
          </button>
        </div>
      </div>

      {/* Tailwind animation */}
      <style jsx>{`
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>, document.body
  );
}

// Sub-component untuk toggle
function CookieToggle({
  icon,
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors ${
            enabled
              ? "bg-gradient-to-r from-blue-500 to-indigo-600"
              : "bg-gray-300 dark:bg-gray-600"
          } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50`}
        />
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-5" : ""
          }`}
        />
      </label>
    </div>
  );
}