"use client";

import { useCheckout } from "@/contexts/checkout-context";
import { dateFormat } from "@/helper/date-format";
import { formatIdr } from "@/helper/formatter";
import { mapEnumPaymentStatus } from "@/helper/map-enum-payment-status";
import { showToast } from "@/helper/show-toast";
import { cn } from "@/lib/utils";
import { PaymentAction } from "@/models/api/purchase/checkout.type";
import { businessPurchaseService } from "@/services/purchase.api";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface PaymentConfirmationProps {
  setShowPaymentSuccess: (show: boolean) => void;
}
export function PaymentConfirmation({
  setShowPaymentSuccess,
}: PaymentConfirmationProps) {
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [zoomImageIndex, setZoomImageIndex] = useState<number | null>(null);
  const { product, detailPricing, checkoutResult } = useCheckout();
  const { businessId } = useParams() as { businessId: string };
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);
  if (!checkoutResult) return null;

  const handleCheckPaymentStatus = async () => {
    try {
      setIsChecking(true);
      const { data: res } = await businessPurchaseService.getDetail(
        businessId,
        checkoutResult?.id
      );
      showToast(
        res.data.status === "Success" ? "success" : "info",
        mapEnumPaymentStatus.getStatusDescription(res.data.status)
      );
      if (res.data.status !== checkoutResult?.status) {
        queryClient.clear();
      }
      if (res.data.status === "Success") {
        await sleep(1000);
        setShowPaymentSuccess(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopy = async (str: string) => {
    try {
      await navigator.clipboard.writeText(str);
      showToast("success", "Berhasil menyalin ke clipboard");
    } catch {
      showToast("error", "Gagal menyalin");
    }
  };

  const handleToggleExpanded = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDownloadImage = (src: string) => {
    try {
      const a = document.createElement("a");
      a.href = src;
      a.download = "qris.png";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("success", "QR berhasil diunduh");
    } catch {
      showToast("error", "Gagal mengunduh QR");
    }
  };

  const handleOpenDeeplink = (url: string) => {
    try {
      // Klik user -> aman untuk navigate / open
      const isHttp = /^https?:\/\//i.test(url);
      if (isHttp) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        // custom scheme (gojek://, ovo://, shopeeid://, etc.)
        window.location.href = url;
      }
    } catch {
      showToast(
        "error",
        "Tidak dapat membuka tautan. Pastikan aplikasi terpasang."
      );
    }
  };

  const VAInstructions = (
    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 text-left">
      <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-3">
        Cara Melakukan Pembayaran:
      </h4>
      <div className="space-y-3 text-sm sm:text-base text-blue-800 dark:text-blue-200">
        <Step
          n={1}
          text="Salin nomor Virtual Account di atas dengan menekan tombol copy."
        />
        <Step n={2} text="Buka aplikasi mobile banking atau ATM bank Anda." />
        <Step n={3} text='Pilih menu "Transfer" atau "Pembayaran".' />
        <Step n={4} text="Masukkan nomor Virtual Account yang sudah disalin." />
        <Step n={5} text="Periksa kembali detail pembayaran dan konfirmasi." />
        <Step n={6} text="Masukkan PIN/OTP untuk menyelesaikan pembayaran." />
      </div>
      <Note text="Pembayaran akan diproses otomatis setelah transfer berhasil. Pastikan nominal sesuai total." />
    </div>
  );

  const QRISInstructions = (
    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 text-left">
      <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-3">
        Cara Membayar dengan QRIS:
      </h4>
      <div className="space-y-3 text-sm sm:text-base text-blue-800 dark:text-blue-200">
        <Step
          n={1}
          text="Buka aplikasi e-wallet/bank (GoPay, OVO, ShopeePay, DANA, BCA Mobile, dsb.)."
        />
        <Step
          n={2}
          text='Pilih menu "Scan" / "QRIS". Arahkan kamera ke QR di layar.'
        />
        <Step
          n={3}
          text="Jika perlu, tekan Perbesar atau Unduh, lalu scan dari galeri (fitur ini didukung beberapa aplikasi)."
        />
        <Step n={4} text="Periksa nominal dan detail pembayaran, lanjutkan." />
        <Step n={5} text="Konfirmasi pembayaran menggunakan PIN/biometrik." />
        <Step
          n={6}
          text='Kembali ke halaman ini dan tekan "Cek Status Pembayaran".'
        />
      </div>
      <Note text="QR akan kedaluwarsa sesuai waktu yang tertera. Jika gagal scan, unduh QR lalu scan dari galeri." />
    </div>
  );

  const RedirectInstructions = (
    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 text-left">
      <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-3">
        Cara Melanjutkan Pembayaran:
      </h4>
      <div className="space-y-3 text-sm sm:text-base text-blue-800 dark:text-blue-200">
        <Step n={1} text='Tekan tombol "Buka Aplikasi".' />
        <Step
          n={2}
          text="Jika tidak terbuka, pastikan aplikasi e-wallet terpasang dan coba lagi."
        />
        <Step
          n={3}
          text="Ikuti instruksi di aplikasi hingga pembayaran berhasil."
        />
        <Step
          n={4}
          text='Kembali ke halaman ini dan tekan "Cek Status Pembayaran".'
        />
      </div>
      <Note text="Sebagian browser bisa memblokir deeplink. Jika perlu, salin link lalu tempel di kolom alamat browser/app yang mendukung." />
    </div>
  );

  const renderAction = (item: PaymentAction, index: number) => {
    const isExpanded = expandedIndexes.includes(index);

    switch (item.type) {
      case "text":
        return (
          <>
            <SectionHeader title={item.action} />
            <Box>
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white font-mono break-all">
                  {item.value}
                </span>
                <IconButton
                  title="Salin nomor virtual account"
                  onClick={() => handleCopy(item.value)}
                />
              </div>
            </Box>

            <GuideToggle
              isExpanded={isExpanded}
              onToggle={() => handleToggleExpanded(index)}
            />
            {isExpanded && VAInstructions}
          </>
        );

      case "image":
        return (
          <>
            <SectionHeader title={item.action} />
            <Box>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setZoomImageIndex(index)}
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  aria-label="Perbesar QR"
                  title="Klik untuk memperbesar"
                >
                  {/* aspect-square agar QR tidak gepeng */}
                  <div className="aspect-square w-full grid place-items-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.value}
                      alt="QRIS untuk pembayaran"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomImageIndex(index)}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Perbesar
                  </button>
                  <button
                    onClick={() => handleDownloadImage(item.value)}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                  >
                    Unduh QR
                  </button>
                </div>
              </div>
            </Box>

            <GuideToggle
              isExpanded={isExpanded}
              onToggle={() => handleToggleExpanded(index)}
            />
            {isExpanded && QRISInstructions}

            {/* Modal zoom untuk QR */}
            {zoomImageIndex === index && (
              <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                onClick={() => setZoomImageIndex(null)}
              >
                <div
                  className="bg-white dark:bg-gray-900 rounded-xl p-2 sm:p-4 max-w-3xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-2 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-semibold">
                      QRIS Pembayaran
                    </h4>
                    <button
                      onClick={() => setZoomImageIndex(null)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="w-full grid place-items-center p-2 sm:p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.value}
                      alt="QRIS untuk pembayaran"
                      className="max-h-[70vh] object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDownloadImage(item.value)}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                    >
                      Unduh QR
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case "redirect":
        return (
          <>
            <SectionHeader title={item.action} />
            <Box>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tautan pembayaran
                  </div>
                  <div className="font-mono text-gray-900 dark:text-white break-all text-sm sm:text-base">
                    {item.value}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDeeplink(item.value)}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                  >
                    Buka Aplikasi
                  </button>
                  <button
                    onClick={() => handleCopy(item.value)}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Salin Link
                  </button>
                </div>
              </div>
            </Box>

            <GuideToggle
              isExpanded={isExpanded}
              onToggle={() => handleToggleExpanded(index)}
            />
            {isExpanded && RedirectInstructions}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Pembayaran dengan {checkoutResult?.method?.toUpperCase()}
        </h1>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
        {product?.name} • Total {formatIdr(detailPricing?.total)}
      </p>

      {checkoutResult?.paymentActions.map((action, index) => (
        <div key={index} className="text-left">
          {renderAction(action, index)}
        </div>
      ))}

      {/* Countdown / Expired info */}
      <div className="border-2 border-orange-500 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 bg-orange-50 dark:bg-orange-900/20 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
            Selesaikan pembayaran sebelum
          </span>
          <span className="text-orange-600 dark:text-orange-400 font-bold text-base sm:text-lg">
            {dateFormat.indonesianDate(new Date(checkoutResult?.expiredAt))}{" "}
            {dateFormat.getHhMm(new Date(checkoutResult?.expiredAt))}
          </span>
        </div>
      </div>

      {/* Check Payment Status Button */}
      <button
        onClick={handleCheckPaymentStatus}
        className={cn(
          "text-white text-sm sm:text-base lg:text-lg font-medium w-full py-3 sm:py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors mb-4",
          isChecking
            ? "bg-gray-500 dark:bg-gray-700"
            : "bg-blue-600 dark:bg-blue-500"
        )}
      >
        {isChecking ? "Memeriksa..." : "Cek Status Pembayaran"}
      </button>

      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words">
        Batas waktu pembayaran: {checkoutResult?.expiredAt}
      </p>
    </div>
  );
}

/* ---------- UI subcomponents ---------- */
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 sm:mb-4">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

function IconButton({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
      title={title}
    >
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </button>
  );
}

function GuideToggle({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <button
        onClick={onToggle}
        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              Panduan Pembayaran
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
        {n}
      </span>
      <p>{text}</p>
    </div>
  );
}

function Note({ text }: { text: string }) {
  return (
    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start gap-2">
        <svg
          className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Catatan:</strong> {text}
        </p>
      </div>
    </div>
  );
}
