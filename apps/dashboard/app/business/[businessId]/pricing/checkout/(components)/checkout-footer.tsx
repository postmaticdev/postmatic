import Link from "next/link";

export function CheckoutFooter() {
  return (
    <div className="hidden lg:flex justify-center gap-x-2 mt-8 text-sm">
      <Link href="/kebijakan-cookie" className="text-gray-800 dark:text-gray-300 hover:underline">
        Kebijakan Cookie
      </Link>
      <span className="text-gray-800 dark:text-gray-300">·</span>
      <Link href="/penghapusan-data" className="text-gray-800 dark:text-gray-300 hover:underline">
        Penghapusan Data
      </Link>
      <span className="text-gray-800 dark:text-gray-300">·</span>
      <Link href="/kebijakan-privasi" className="text-gray-800 dark:text-gray-300 hover:underline">
        Kebijakan Privasi
      </Link>
      <span className="text-gray-800 dark:text-gray-300">·</span>
      <Link href="/syarat-layanan" className="text-gray-800 dark:text-gray-300 hover:underline">
        Syarat Layanan
      </Link>
    </div>
  );
}
