"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Sparkles, Zap } from "lucide-react";

export default function ScrollbarDemo() {
  const [activeTab, setActiveTab] = useState("default");
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Auto-rotate tabs for demo effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        const tabs = ["default", "thin", "ultra-thin", "hidden"];
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab, isAnimating]);

  const generateContent = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div 
        key={i} 
        className="p-4 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
        style={{
          animationDelay: `${i * 100}ms`,
          animation: 'slideInUp 0.6s ease-out forwards'
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {i + 1}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Item {i + 1}
          </h3>
          <Sparkles className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          Ini adalah contoh konten untuk mendemonstrasikan scrollbar yang modern dan minimalis. 
          Scrollbar ini dirancang dengan pendekatan yang bersih dan tidak mengganggu pengalaman pengguna.
        </p>
        <div className="mt-3 flex gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
            Modern
          </span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
            Minimalis
          </span>
        </div>
      </div>
    ));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  const scrollbarVariants = [
    { id: "default", name: "Default", size: "8px", icon: "🎨", color: "from-blue-500 to-indigo-600" },
    { id: "thin", name: "Thin", size: "6px", icon: "✨", color: "from-purple-500 to-pink-600" },
    { id: "ultra-thin", name: "Ultra Thin", size: "4px", icon: "⚡", color: "from-green-500 to-teal-600" },
    { id: "hidden", name: "Hidden", size: "0px", icon: "👻", color: "from-gray-500 to-slate-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header with animated background */}
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
          <div className="relative text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Demo Scrollbar Modern & Minimalis
              </h1>
              <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Jelajahi berbagai gaya scrollbar yang elegan dan modern. Pilih jenis scrollbar di bawah untuk melihat perbedaannya secara langsung.
            </p>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          {scrollbarVariants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => {
                setActiveTab(variant.id);
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 500);
              }}
              className={`relative group px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === variant.id
                  ? `bg-gradient-to-r ${variant.color} text-white shadow-lg shadow-blue-500/25`
                  : "bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-sm border border-gray-200 dark:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{variant.icon}</span>
                <span>{variant.name}</span>
                <span className="text-xs opacity-75">({variant.size})</span>
              </div>
              {activeTab === variant.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-ping"></div>
              )}
            </button>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ChevronDown className="w-4 h-4" />
            <span>Scroll Progress</span>
          </div>
          <div className="w-32 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(scrollProgress)}%
          </span>
        </div>

        {/* Enhanced Demo Containers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vertical Scroll */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <ChevronDown className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Scroll Vertikal
              </h2>
            </div>
            <div
              className={`h-80 overflow-y-auto border-2 border-gray-200 dark:border-slate-600 rounded-2xl p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 ${
                activeTab === "default"
                  ? ""
                  : activeTab === "thin"
                  ? "scrollbar-thin"
                  : activeTab === "ultra-thin"
                  ? "scrollbar-ultra-thin"
                  : "scrollbar-hide"
              }`}
              onScroll={handleScroll}
            >
              {generateContent(20)}
            </div>
          </div>

          {/* Horizontal Scroll */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Scroll Horizontal
              </h2>
            </div>
            <div
              className={`h-80 overflow-x-auto border-2 border-gray-200 dark:border-slate-600 rounded-2xl p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 ${
                activeTab === "default"
                  ? ""
                  : activeTab === "thin"
                  ? "scrollbar-thin"
                  : activeTab === "ultra-thin"
                  ? "scrollbar-ultra-thin"
                  : "scrollbar-hide"
              }`}
            >
              <div className="flex gap-6" style={{ width: "1200px" }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-64 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4">
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Card {i + 1}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Konten horizontal yang dapat di-scroll dengan scrollbar yang elegan dan modern.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        Modern
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12 p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Fitur Scrollbar Modern
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Desain yang dirancang untuk memberikan pengalaman terbaik
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "✨",
                title: "Desain Minimalis",
                description: "Scrollbar yang tipis dan tidak mengganggu dengan transparansi yang elegan",
                color: "from-blue-500 to-indigo-600"
              },
              {
                icon: "🌙",
                title: "Dark Mode Support",
                description: "Otomatis menyesuaikan warna untuk mode gelap dan terang",
                color: "from-purple-500 to-pink-600"
              },
              {
                icon: "⚡",
                title: "Smooth Transitions",
                description: "Animasi hover yang halus untuk pengalaman yang lebih baik",
                color: "from-green-500 to-teal-600"
              },
              {
                icon: "🔧",
                title: "Customizable",
                description: "Tersedia dalam berbagai ukuran: default, thin, ultra-thin, dan hidden",
                color: "from-orange-500 to-red-600"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 border border-gray-200 dark:border-slate-600 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'slideInUp 0.8s ease-out forwards'
                }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-200 dark:border-slate-600">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Cara Penggunaan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-white/60 dark:bg-slate-700/60 rounded-lg">
              <code className="text-blue-600 dark:text-blue-400 font-mono">
                scrollbar-thin
              </code>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Untuk scrollbar tipis (6px)
              </p>
            </div>
            <div className="p-4 bg-white/60 dark:bg-slate-700/60 rounded-lg">
              <code className="text-blue-600 dark:text-blue-400 font-mono">
                scrollbar-ultra-thin
              </code>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Untuk scrollbar ultra tipis (4px)
              </p>
            </div>
            <div className="p-4 bg-white/60 dark:bg-slate-700/60 rounded-lg">
              <code className="text-blue-600 dark:text-blue-400 font-mono">
                scrollbar-hide
              </code>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Untuk menyembunyikan scrollbar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
