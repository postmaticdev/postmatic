import { LINKEDIN, TWITTER } from "@/constants";

export default function ComingSoon() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-float-1 absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-sky-500/20 blur-xl" />
        <div className="animate-float-2 absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-indigo-500/20 blur-xl" />
        <div className="animate-float-3 absolute bottom-1/4 left-1/3 h-36 w-36 rounded-full bg-purple-500/20 blur-xl" />
      </div>

      {/* main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-glow">
          Coming Soon
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-300 sm:text-xl">
          We’re building something amazing. Stay tuned for real-time updates,
          beautiful dashboards, and lightning-fast insights.
        </p>

        {/* social links */}
        <div className="mt-10 flex gap-6">
          <a
            href={TWITTER}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition hover:text-sky-400"
            aria-label="Twitter"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition hover:text-sky-400"
            aria-label="LinkedIn"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
