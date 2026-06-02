export const restaurantTimeZone = "Europe/London";
export const openingTimeLabel = "5:30pm - 10:30pm";

const openMinute = 17 * 60 + 30;
const closeMinute = 22 * 60 + 30;

const defaultBankHolidayMondays = new Set([
  "2026-04-06",
  "2026-05-04",
  "2026-05-25",
  "2026-08-31",
  "2026-12-28",
  "2027-04-05",
  "2027-05-03",
  "2027-05-31",
  "2027-08-30",
  "2027-12-27",
]);

type ZonedParts = {
  day: number;
  hour: number;
  isoDate: string;
  minute: number;
};

function getConfiguredBankHolidayMondays() {
  const configured = process.env.BANK_HOLIDAY_MONDAYS ?? "";
  const dates = configured
    .split(",")
    .map((date) => date.trim())
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));

  return dates.length > 0 ? new Set(dates) : defaultBankHolidayMondays;
}

function getZonedParts(date = new Date()): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: restaurantTimeZone,
    weekday: "short",
    year: "numeric",
  }).formatToParts(date);

  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = read("weekday");
  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };
  const year = read("year");
  const month = read("month");
  const dayOfMonth = read("day");

  return {
    day: dayMap[weekday] ?? 0,
    hour: Number(read("hour")) || 0,
    isoDate: `${year}-${month}-${dayOfMonth}`,
    minute: Number(read("minute")) || 0,
  };
}

function isTradingDay(parts: ZonedParts) {
  if (parts.day >= 2 && parts.day <= 6) {
    return true;
  }

  if (parts.day === 0) {
    return true;
  }

  return parts.day === 1 && getConfiguredBankHolidayMondays().has(parts.isoDate);
}

export function getAutomaticOrderingWindow(date = new Date()) {
  const parts = getZonedParts(date);
  const minuteOfDay = parts.hour * 60 + parts.minute;
  const tradingDay = isTradingDay(parts);
  const openNow =
    tradingDay && minuteOfDay >= openMinute && minuteOfDay < closeMinute;

  return {
    acceptingPreorders: !openNow,
    isOpenNow: openNow,
    isTradingDay: tradingDay,
    message: openNow
      ? `Open now for collection and delivery until ${openingTimeLabel.split(" - ")[1]}.`
      : tradingDay
        ? `We are closed right now. Pre-orders are accepted for today's service, ${openingTimeLabel}.`
        : `Closed today. Pre-orders are accepted for the next opening day, ${openingTimeLabel}.`,
    nextServiceLabel: openingTimeLabel,
  };
}
