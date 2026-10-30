// Live Nepal Time (NPT: UTC+5:45) and Bikram Sambat (B.S.) Calendar Utility
// Dynamic, real-time Bikram Sambat conversion with pure Nepali Unicode

import NepaliDate from 'nepali-date-converter';

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (digit) => NEPALI_DIGITS[parseInt(digit, 10)] || digit);
}

const NEPALI_DAYS = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
];

export interface FormattedNepalTime {
  english: string;
  nepali: string;
  timeOnlyEn: string;
  timeOnlyNp: string;
  time12En: string;
  time12Np: string;
  bsDateEn: string; // e.g. "2083/07/13"
  bsDateNp: string; // e.g. "२०८३/०७/१३"
  asojDateEn: string; // Dynamic formatted date in English (e.g. "13 Kartik 2083")
  asojDateNp: string; // Dynamic formatted date in Nepali (e.g. "१३ कार्तिक २०८३")
  bsDateFormattedEn: string; // "13 Kartik 2083"
  bsDateFormattedNp: string; // "१३ कार्तिक २०८३"
  ddMmYyEn: string; // e.g. "13:07:83"
  ddMmYyNp: string; // e.g. "१३:०७:८३"
  hhMmSsEn: string; // "08:15:20 PM"
  hhMmSsNp: string; // "०८:१५:२० राती"
  nepaliDay: string;
  rawDate: Date;
}

/**
 * Returns the exact current year, month, day, hour, minute, second in Asia/Kathmandu timezone (UTC+5:45)
 */
export function getNepalDateTimeParts(now = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    }).formatToParts(now);

    const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
    const year = getPart('year') || now.getFullYear();
    const month = getPart('month') || now.getMonth() + 1;
    const day = getPart('day') || now.getDate();
    let hour = getPart('hour');
    if (hour === 24) hour = 0;
    const minute = getPart('minute');
    const second = getPart('second');

    return { year, month, day, hour, minute, second };
  } catch {
    // Fallback: UTC + 5 hours 45 minutes
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const nepalDate = new Date(utcMs + (5 * 60 + 45) * 60000);
    return {
      year: nepalDate.getFullYear(),
      month: nepalDate.getMonth() + 1,
      day: nepalDate.getDate(),
      hour: nepalDate.getHours(),
      minute: nepalDate.getMinutes(),
      second: nepalDate.getSeconds()
    };
  }
}

export function getNepalCurrentDate(): Date {
  const p = getNepalDateTimeParts();
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

/**
 * Formats live Nepal Standard Time (12-hour format) and current dynamic Bikram Sambat Date
 */
export function formatNepalTime(baseDate = new Date()): FormattedNepalTime {
  const p = getNepalDateTimeParts(baseDate);
  const kathmanduDate = new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);

  // Convert to dynamic Bikram Sambat (B.S.)
  const bs = new NepaliDate(kathmanduDate);

  const hours24 = p.hour;
  const minutes = String(p.minute).padStart(2, '0');
  const seconds = String(p.second).padStart(2, '0');

  const ampmEn = hours24 >= 12 ? 'PM' : 'AM';
  const ampmNp =
    hours24 >= 12
      ? hours24 >= 19
        ? 'राती'
        : hours24 >= 16
        ? 'साँझ'
        : 'दिउँसो'
      : hours24 >= 4
      ? 'बिहान'
      : 'राती';

  const displayHours = hours24 % 12 || 12;
  const displayHoursStr = String(displayHours).padStart(2, '0');

  // 12-Hour format strings
  const hhMmSsEn = `${displayHoursStr}:${minutes}:${seconds} ${ampmEn}`;
  const hhMmSsNp = `${toNepaliDigits(displayHoursStr)}:${toNepaliDigits(minutes)}:${toNepaliDigits(seconds)} ${ampmNp}`;

  const time12En = hhMmSsEn;
  const time12Np = hhMmSsNp;

  const timeOnlyEn = `${hhMmSsEn} NPT`;
  const timeOnlyNp = `${hhMmSsNp} (नेपाल समय)`;

  // Dynamic Bikram Sambat date format strings
  const bsYear = String(bs.getYear());
  const bsMonthNum = String(bs.getMonth() + 1).padStart(2, '0');
  const bsDayNum = String(bs.getDate()).padStart(2, '0');

  const bsDateEn = `${bsYear}/${bsMonthNum}/${bsDayNum}`;
  const bsDateNp = `${toNepaliDigits(bsYear)}/${toNepaliDigits(bsMonthNum)}/${toNepaliDigits(bsDayNum)}`;

  // Formatted as "13 Kartik 2083" and "१३ कार्तिक २०८३"
  const bsDateFormattedEn = bs.format('DD MMMM YYYY');
  const bsDateFormattedNp = bs.format('DD MMMM YYYY', 'np');

  // Kept for backward compatibility with Header.tsx navigation badges
  const asojDateEn = bsDateFormattedEn;
  const asojDateNp = bsDateFormattedNp;

  const ddMmYyEn = `${bsDayNum}:${bsMonthNum}:${bsYear.slice(-2)}`;
  const ddMmYyNp = `${toNepaliDigits(bsDayNum)}:${toNepaliDigits(bsMonthNum)}:${toNepaliDigits(bsYear.slice(-2))}`;

  const nepaliDay = NEPALI_DAYS[kathmanduDate.getDay()];
  const english = `${bsDateFormattedEn} · ${hhMmSsEn} NPT (UTC+5:45)`;
  const nepali = `${nepaliDay}, ${bsDateFormattedNp}, ${hhMmSsNp} (नेपाल समय)`;

  return {
    english,
    nepali,
    timeOnlyEn,
    timeOnlyNp,
    time12En,
    time12Np,
    bsDateEn,
    bsDateNp,
    asojDateEn,
    asojDateNp,
    bsDateFormattedEn,
    bsDateFormattedNp,
    ddMmYyEn,
    ddMmYyNp,
    hhMmSsEn,
    hhMmSsNp,
    nepaliDay,
    rawDate: kathmanduDate
  };
}
