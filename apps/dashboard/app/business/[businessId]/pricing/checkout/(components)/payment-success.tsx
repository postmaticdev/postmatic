"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function PaymentSuccess() {
  const { businessId } = useParams() as { businessId: string };
  return (
    <div className="text-center">
      <div className="mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Pembayaran Berhasil!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 px-4">
          Terima kasih! Pembayaran Anda telah berhasil diproses.
        </p>
      </div>

      <Link
        href={`/business/${businessId}/dashboard`}
        prefetch={false}
        className="inline-block bg-blue-600 dark:bg-blue-500 text-white text-sm sm:text-base lg:text-lg font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
