import { Category, CourseReview, StarCount } from "./interface";
import { differenceInMinutes, differenceInSeconds, format } from "date-fns";

export const sortOptions = [
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Username", value: "user_name" },
];

export const getCategoryName = (
  categories: Category[],
  activeCategory: string | null | undefined
) => {
  const data = categories.find((item) => item?.category_id === activeCategory);
  console.log(data);
  return data?.category_name;
};

export const formattedTimeForChatList = (time: number | undefined) => {
  const messageDate = new Date((time || 1) * 1000);
  const now = new Date();
  const seconds = differenceInSeconds(now, messageDate);
  const minutes = differenceInMinutes(now, messageDate);

  if (seconds < 60) {
    return `now`;
  } else if (minutes < 10) {
    return `${minutes} minutes ago`;
  } else if (now.toDateString() !== messageDate.toDateString()) {
    return format(messageDate, "MMMM dd, yyyy");
  } else {
    return format(messageDate, "hh:mm a"); // e.g., "03:47 PM"
  }
};

export function getStatusColor(value: string | number): string {
  const RED = "#FB4A49";
  const GREEN = "#5EB85C";
  const YELLOW = "#FFC023";
  const DEFAULT = "#0177DB";

  if (!isNaN(Number(value))) {
    const score = Number(value);

    if (score >= 80) return GREEN;
    if (score >= 50) return YELLOW;
    return RED;
  }

  if (typeof value === "string" && value.includes(":")) {
    const [hours, minutes, seconds] = value.split(":").map(Number);

    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      if (totalSeconds >= 3600) return GREEN; // ≥ 1 hour
      if (totalSeconds >= 1800) return YELLOW; // ≥ 30 mins
      return RED;
    }
  }

  return DEFAULT;
}

export const valueFormatter = (num: number, digits: number) => {
  if (num > 999) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return item ? num >= item.value : "0";
      });
    return item
      ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
  } else {
    return num ? Math.floor(num) : "0";
  }
};

export function numberWithCommas(x: number | string) {
  if (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return "0.00";
  }
}

export const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return value.toString();
};

export const getRatingDistribution = (reviews: CourseReview[]): StarCount[] => {
  const total = reviews.length;

  const ratingCountMap: { [key: number]: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    const rating = Math.floor(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCountMap[rating]++;
    }
  });

  const result: StarCount[] = [5, 4, 3, 2, 1].map((star) => ({
    rating: `${star} Star`,
    count: total > 0 ? Math.round((ratingCountMap[star] / total) * 100) : 0,
  }));

  return result;
};

export const getRandomBgColor = () => {
  const colors = [
    "#FFB6C1",
    "#FFD700",
    "#7FFFD4",
    "#ADD8E6",
    "#90EE90",
    "#FFA07A",
    "#DDA0DD",
    "#F08080",
    "#AFEEEE",
    "#E6E6FA",
    "#FF6347",
    "#00CED1",
    "#48D1CC",
    "#20B2AA",
    "#40E0D0",
    "#87CEFA",
    "#87CEEB",
    "#6495ED",
    "#9370DB",
    "#BA55D3",
    "#8A2BE2",
    "#5F9EA0",
    "#66CDAA",
    "#B0E0E6",
    "#FFC0CB",
    "#FF69B4",
    "#FF1493",
    "#DB7093",
    "#BC8F8F",
    "#CD5C5C",
    "#A0522D",
    "#DEB887",
    "#F4A460",
    "#D2B48C",
    "#BDB76B",
    "#9ACD32",
    "#6B8E23",
    "#556B2F",
    "#2E8B57",
    "#3CB371",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

export const isValidUrl = (url?: string) => {
  try {
    return Boolean(url && new URL(url));
  } catch {
    return false;
  }
};

export const getImageUrl = (url?: string | object | null) => {
  if (!url) return "";
  if (typeof url !== "string") return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${url}`;
};

export const formatLabel = (val?: string | number | null) => {
  if (!val) return "";
  if (typeof val !== "string") return String(val);
  return val
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatMediaDuration = (seconds?: number | null) => {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`;
  return `${secs}s`;
};

export const materialKindLabel = (fileType?: string | null) => {
  switch ((fileType || "").toLowerCase()) {
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "pdf":
      return "PDF";
    case "image":
      return "Image";
    case "document":
      return "Document";
    default:
      return fileType ? fileType.toUpperCase() : "File";
  }
};

export const formatDuration = (val?: string | number | null) => {
  if (!val) return "";
  const str = String(val).trim().toLowerCase();
  const map: Record<string, string> = {
    "1_week": "1 Week",
    "1_weeks": "1 Week",
    "2_week": "2 Weeks",
    "2_weeks": "2 Weeks",
    "3_week": "3 Weeks",
    "3_weeks": "3 Weeks",
    "4_week": "4 Weeks",
    "4_weeks": "4 Weeks",
    "1_month": "1 Month",
    "1_months": "1 Month",
    "2_month": "2 Months",
    "2_months": "2 Months",
    "3_month": "3 Months",
    "3_months": "3 Months",
    "6_month": "6 Months",
    "6_months": "6 Months",
    "12_month": "12 Months",
    "12_months": "12 Months",
    "1_year": "1 Year",
  };
  if (map[str]) return map[str];
  return formatLabel(String(val));
};


