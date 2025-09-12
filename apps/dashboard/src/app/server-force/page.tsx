export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      server force
      <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
        NEXT_PUBLIC_API_ORIGIN:{" "}
        {process.env.NEXT_PUBLIC_API_ORIGIN || "env not detected / set"}
      </code>
      <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
        API_ORIGIN: {process.env.API_ORIGIN || "env not detected / set"}
      </code>
    </div>
  );
}

export const dynamic = "force-dynamic"; // ⬅️ paksa runtime render
