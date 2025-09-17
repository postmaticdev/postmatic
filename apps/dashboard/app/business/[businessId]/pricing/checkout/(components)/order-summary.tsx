import { useCheckout } from "@/contexts/checkout-context";
import { formatIdr } from "@/helper/formatter";
import Image from "next/image";

interface OrderSummaryProps {
  variant: "sidebar" | "mobile";
}

export function OrderSummary({ variant }: OrderSummaryProps) {
  const isDesktop = variant === "sidebar";
  const { product, detailPricing } = useCheckout();

  const detailItems = [
    {
      name: "Subtotal",
      value: detailPricing?.item,
    },
    {
      name: "Admin",
      value: detailPricing?.admin,
    },
    {
      name: "Discount",
      value: detailPricing?.discount,
    },
    {
      name: "Tax",
      value: detailPricing?.tax,
    },
  ];
  // .filter((item) => item.value !== 0);

  return (
    <div
      className={`
      ${
        isDesktop
          ? "hidden lg:flex w-[516px] bg-blue-600 dark:bg-blue-700 text-white p-12 flex-col"
          : "lg:hidden mb-6"
      }
    `}
    >
      <div
        className={`
        ${
          isDesktop
            ? "flex-1"
            : "bg-primary border border-border rounded-lg p-6 text-white"
        }
      `}
      >
        {/* Logo - Only show on desktop */}
        {isDesktop && (
          <div className="mb-8">
            <Image
              src="/logowhite.png"
              alt="Postmatic Logo"
              width={70}
              height={40}
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className=" text-sm mb-4">Subscribe to Postmatic</h2>
          <div
            className={`font-bold text-white mb-6 ${
              isDesktop ? "text-3xl" : "text-2xl"
            }`}
          >
            {formatIdr(product?.defaultPrice || 0)}{" "}
            <span
              className={` font-normal ${isDesktop ? "text-lg" : "text-base"}`}
            >
              per {product?.validForInfo}
            </span>
          </div>

          {/* Product Details */}
          <div className="border-b border-white pb-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`bg-gray-600 dark:bg-gray-500 rounded-sm flex items-center justify-center ${
                    isDesktop ? "w-8 h-8" : "w-6 h-6"
                  }`}
                >
                  <div
                    className={`bg-gray-400 rounded-sm ${
                      isDesktop ? "w-4 h-4" : "w-3 h-3"
                    }`}
                  ></div>
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-white ${
                      isDesktop ? "text-lg" : "text-base"
                    }`}
                  >
                    {product?.name}
                  </h3>
                  <p
                    className={`text-white mt-1 ${
                      isDesktop ? "text-sm" : "text-xs"
                    }`}
                  >
                    {product?.description}
                  </p>
                  <p
                    className={`text-white mt-2 ${
                      isDesktop ? "text-xs" : "text-xs"
                    }`}
                  >
                    Billed {product?.validForInfo}
                  </p>
                </div>
              </div>
              <div
                className={`text-white font-semibold ${
                  isDesktop ? "text-base" : "text-sm"
                }`}
              >
                {formatIdr(product?.defaultPrice || 0)}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={isDesktop ? "space-y-3" : "space-y-2"}>
            {detailItems.map((item, index) => (
              <div className="flex justify-between items-center" key={index}>
                <span
                  className={`text-white ${
                    isDesktop ? "text-base" : "text-sm"
                  }`}
                >
                  {item.name}
                </span>
                <span
                  className={`text-white ${
                    isDesktop ? "text-base" : "text-sm"
                  }`}
                >
                  {formatIdr(item.value || 0)}
                </span>
              </div>
            ))}

            <div
              className={`border-t border-white ${isDesktop ? "pt-3" : "pt-2"}`}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`text-white font-semibold ${
                    isDesktop ? "text-base" : "text-sm"
                  }`}
                >
                  Total
                </span>
                <span
                  className={`text-white font-semibold ${
                    isDesktop ? "text-lg" : "text-base"
                  }`}
                >
                  {formatIdr(detailPricing?.total || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info - Only show on desktop sidebar */}
      {isDesktop && (
        <div className="mt-auto pt-40">
          <div className="mb-4">
            <h2 className="text-sm font-regular">Need help? Contact</h2>
            <p className="text-md font-medium">team@postmatic.id</p>
          </div>
          <p>© 2025 Postmatic. Hak cipta dilindungi undang-undang</p>
        </div>
      )}
    </div>
  );
}
