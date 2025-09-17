// Data generator untuk berbagai periode waktu
export interface ChartDataPoint {
  date: string;
  images: number;
  video: number;
  livestream: number;
}

export type TimePeriod = "7d" | "30d" | "1y";

// Generate sample chart data based on period
export function getChartData(period: TimePeriod): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const today = new Date();
  
  let days: number;
  switch (period) {
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "1y":
      days = 365;
      break;
    default:
      days = 7;
  }
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate random data with some trend
    const baseImages = 100 + Math.sin(i * 0.5) * 50;
    const baseVideo = 80 + Math.cos(i * 0.3) * 40;
    const baseLivestream = 60 + Math.sin(i * 0.7) * 30;
    
    data.push({
      date: date.toISOString().split('T')[0],
      images: Math.max(0, Math.round(baseImages + (Math.random() - 0.5) * 20)),
      video: Math.max(0, Math.round(baseVideo + (Math.random() - 0.5) * 15)),
      livestream: Math.max(0, Math.round(baseLivestream + (Math.random() - 0.5) * 10)),
    });
  }
  
  return data;
}

// Helper function untuk format date range
export function getDateRangeLabel(period: TimePeriod): string {
  const today = new Date();
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  switch (period) {
    case "7d": {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      return `${startDate.toLocaleDateString(
        "id-ID",
        formatOptions
      )} - ${today.toLocaleDateString("id-ID", formatOptions)}`;
    }
    case "30d": {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      return `${startDate.toLocaleDateString(
        "id-ID",
        formatOptions
      )} - ${today.toLocaleDateString("id-ID", formatOptions)}`;
    }
    case "1y": {
      const startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      return `${startDate.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
      })} - ${today.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
      })}`;
    }
    default:
      return "";
  }
}

// Helper function untuk format X-axis labels berdasarkan periode
export function formatXAxisLabel(date: string, period: TimePeriod): string {
  const dateObj = new Date(date);

  switch (period) {
    case "7d":
      return dateObj.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
      });
    case "30d":
      return dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    case "1y":
      return dateObj.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
    default:
      return dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
  }
}
