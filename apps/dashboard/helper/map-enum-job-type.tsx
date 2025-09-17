import { JobType } from "@/models/socket-content";

const getLabel = (type: JobType) => {
  switch (type) {
    case "knowledge":
      return "Generate Dasar";
    case "rss":
      return "Generate RSS";
    case "regenerate":
      return "Generate Ulang";
    case "mask":
      return "Generate Ulang Mask";
    case "mock_knowledge":
      return "Generate Mock";
    case "mock_regenerate":
      return "Generate Ulang Mock";
    case "mock_rss":
      return "Generate RSS Mock";
    case "mock_mask":
      return "Generate Ulang Mask Mock";
    default:
      return "Tidak Diketahui";
  }
};

export const mapEnumJobType = {
  getLabel,
};
