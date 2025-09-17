import { JobStatus } from "@/models/socket-content";
import { CheckCircle, Loader2, X } from "lucide-react";

const getColor = (status: JobStatus) => {
  switch (status) {
    case "queued":
      return "bg-gray-100 text-gray-800";
    case "done":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    case "retrying":
      return "bg-gray-100 text-gray-800";
    case "waiting_before_retry":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getLabel = (status: JobStatus) => {
  switch (status) {
    case "queued":
      return "Menunggu";
    case "done":
      return "Selesai";
    case "processing":
      return "Dalam Proses";
    case "error":
      return "Gagal";
    case "retrying":
      return "Mencoba Lagi";
    case "waiting_before_retry":
      return "Menunggu";
    default:
      return "Menunggu";
  }
};

const getIcon = (status: JobStatus, className?: string) => {
  switch (status) {
    case "queued":
      return <Loader2 className={className} />;
    case "done":
      return <CheckCircle className={className} />;
    case "processing":
      return <Loader2 className={className} />;
    case "error":
      return <X className={className} />;
    case "retrying":
      return <Loader2 className={className} />;
    case "waiting_before_retry":
      return <Loader2 className={className} />;
    default:
      return <Loader2 className={className} />;
  }
};

export const mapEnumJobStatus = {
  getColor,
  getLabel,
  getIcon,
};
