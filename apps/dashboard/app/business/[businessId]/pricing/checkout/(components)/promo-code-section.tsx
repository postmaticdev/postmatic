"use client";

import { useCheckout } from "@/contexts/checkout-context";

export function PromoCodeSection() {
  const {
    product,
    promoState,
    setPromoState,
    onPromoSubmit,
    onClearPromo,
    promoCode,
  } = useCheckout();

  return (
    <div className="mb-8">
      <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
        Kode Promo
      </h3>
      {product?.isValidCode && product?.benefitCode ? (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
          <span className="text-gray-900 dark:text-white">{promoCode}</span>
          <div className="flex items-center">
            <span className="bg-blue-600 dark:bg-blue-500 text-white text-sm px-3 py-1 rounded-md mr-2">
              {product?.benefitCode}
            </span>
            <button
              onClick={onClearPromo}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg flex bg-white dark:bg-gray-800">
          <input
            type="text"
            placeholder="Kode Promo"
            value={promoState}
            onChange={(e) => setPromoState(e.target.value?.toUpperCase())}
            className="flex-1 p-4 rounded-lg outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onPromoSubmit();
              }
            }}
          />
        </div>
      )}
      {!product?.isValidCode && product?.hintCode && (
        <div className="text-red-500 text-sm mt-4">{product?.hintCode}</div>
      )}
    </div>
  );
}
