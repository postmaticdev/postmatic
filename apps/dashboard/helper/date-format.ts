const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const indonesianDate = (date: Date) => {
  return `${days[date.getDay()]} ${date.getDate()} ${
    months[date.getMonth()]
  } ${date.getFullYear()}`;
};

const getHhMm = (date: Date) => {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const getDdMmYyyy = (date: Date) => {
  return new Date(date).toISOString().split("T")[0];
};

export const dateFormat = {
  indonesianDate,
  getHhMm,
  getDdMmYyyy,
};
