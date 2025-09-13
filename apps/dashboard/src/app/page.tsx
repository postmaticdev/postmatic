import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>Hello World CI/CD Works!, Newest Change</div>
      <Link href="/client-force">Client Force</Link>
      <Link href="/client-not-force">Client Not Force</Link>
      <Link href="/server-force">Server Force</Link>
      <Link href="/server-not-force">Server Not Force</Link>
    </div>
  );
}
