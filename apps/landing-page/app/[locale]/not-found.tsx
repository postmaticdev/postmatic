"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-slate-950 to-secondary/50 text-white">
      <h1 className="text-[8rem] md:text-[12rem] font-black tracking-tighter glitch">
        404
      </h1>
      <p className="mt-4 text-xl md:text-2xl opacity-90">Page not found</p>
      <p className="mt-2 text-sm opacity-70">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="flex mt-8 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30 transition"
      >
        <ArrowLeft className="mr-2" /> Back to Home
      </Link>

      {/* Tambahkan style yang sama dengan contoh di atas */}
      <style jsx global>{`
        .glitch {
          animation: glitch-skew 1s infinite linear alternate-reverse;
          position: relative;
        }
        .glitch::before,
        .glitch::after {
          content: "404";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch::before {
          animation: glitch-anim 2s infinite linear alternate-reverse;
          color: #00ffff;
          z-index: -1;
        }
        .glitch::after {
          animation: glitch-anim 2s infinite linear alternate-reverse;
          color: #ff00ff;
          z-index: -2;
        }
        @keyframes glitch-anim {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-2px, 2px);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(2px, -2px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-2px, 2px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(2px, -2px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-2px, 2px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(2px, -2px);
          }
        }
        @keyframes glitch-skew {
          0% {
            transform: skew(0deg);
          }
          10% {
            transform: skew(-2deg);
          }
          20% {
            transform: skew(0deg);
          }
          30% {
            transform: skew(1deg);
          }
          40% {
            transform: skew(0deg);
          }
          50% {
            transform: skew(-1deg);
          }
          60% {
            transform: skew(0deg);
          }
          70% {
            transform: skew(2deg);
          }
          80% {
            transform: skew(0deg);
          }
          90% {
            transform: skew(-1deg);
          }
          100% {
            transform: skew(0deg);
          }
        }
      `}</style>
    </div>
  );
}
