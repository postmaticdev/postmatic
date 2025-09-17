import { useCheckout } from "@/contexts/checkout-context";
import Image from "next/image";

export function PaymentMethodGrid() {
  const { selectedPayment, setSelectedPayment, product } = useCheckout();
  const paymentMethods = product?.pricingByMethod || [];
  return (
    <div className="flex flex-col gap-4 mb-8">
      {paymentMethods.map((method, methodIndex) => (
        <div key={methodIndex}>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm lg:text-base mb-2">
            {method.type}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {method.methods.map((m, i) => (
              <div
                key={i}
                onClick={() =>
                  setSelectedPayment({ code: m.issued.code, type: method.type })
                }
                className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all ${
                  selectedPayment?.code === m.issued.code
                    ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <div className="bg-gray-200 dark:bg-gray-500 rounded-full w-10 h-10 lg:w-12 lg:h-12 mr-3 lg:mr-4 overflow-hidden">
                  <Image
                    src={m.issued.image}
                    alt={m.issued.name}
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm lg:text-base">
                    {m.issued.name}
                  </h3>
                  <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-sm">
                    {method.type}
                  </span>
                </div>
                {selectedPayment?.code === m.issued.code && (
                  <div className="ml-2">
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
