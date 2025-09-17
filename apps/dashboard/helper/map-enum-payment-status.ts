import { EnumPaymentStatus } from "@/models/api/purchase/business.type";

const getStatusColor = (status: EnumPaymentStatus) => {
  switch (status) {
    case "Success":
      return "bg-green-100 text-green-800";
    case "Expired":
      return "bg-gray-100 text-gray-800";
    case "Failed":
      return "bg-red-100 text-red-800";
    case "Canceled":
      return "bg-gray-100 text-gray-800";
    case "Refunded":
      return "bg-gray-100 text-gray-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Denied":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: EnumPaymentStatus) => {
  switch (status) {
    case "Success":
      return "Berhasil";
    case "Expired":
      return "Kadaluarsa";
    case "Failed":
      return "Gagal";
    case "Canceled":
      return "Dibatalkan";
    case "Refunded":
      return "Dikembalikan";
    case "Pending":
      return "Menunggu";
    case "Denied":
      return "Ditolak";
    default:
      return "Menunggu";
  }
};

const getStatusDescription = (status: EnumPaymentStatus) => {
  switch (status) {
    case "Success":
      return "Pembayaran berhasil";
    case "Expired":
      return "Pembayaran kadaluarsa";
    case "Failed":
      return "Pembayaran gagal";
    case "Canceled":
      return "Pembayaran dibatalkan";
    case "Refunded":
      return "Pembayaran dikembalikan";
    case "Pending":
      return "Menunggu pembayaran";
    case "Denied":
      return "Pembayaran ditolak";
    default:
      return "Menunggu pembayaran";
  }
};

export const mapEnumPaymentStatus = {
  getStatusColor,
  getStatusLabel,
  getStatusDescription,
};
