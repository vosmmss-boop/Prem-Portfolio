// Live Nepal Time (NPT / NST: UTC+5:45)
// Standardized format: English and pure Nepali Unicode (no Hindi terms)
// Bikram Sambat Date: 2083/06/21 (Ashwin 21, 2083 BS)

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (digit) => NEPALI_DIGITS[parseInt(digit, 10)] || digit);
}

const NEPALI_MONTHS_BS = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

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
  bsDateEn: string; // "2083/06/21"
  bsDateNp: string; // "२०८३/०६/२१"
  ddMmYyEn: string; // "21:06:83"
  ddMmYyNp: string; // "२१:०६:८३"
  hhMmSsEn: string; // "05:45:12 PM"
  hhMmSsNp: string; // "०५:४५:१२ साँझ"
  nepaliDay: string;
  rawDate: Date;
}

export function getNepalCurrentDate(): Date {
  // Current UTC time shifted by +5 hours 45 minutes
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalOffsetMs = (5 * 60 + 45) * 60000;
  return new Date(utc + nepalOffsetMs);
}

export function formatNepalTime(date = getNepalCurrentDate()): FormattedNepalTime {
  const monthsEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const yearEn = date.getFullYear();
  const monthEn = monthsEn[date.getMonth()];
  const dayEn = String(date.getDate()).padStart(2, '0');

  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const ampmEn = hours24 >= 12 ? 'PM' : 'AM';
  const ampmNp = hours24 >= 12
    ? (hours24 >= 18 ? 'साँझ' : (hours24 >= 12 ? 'दिउँसो' : 'अपरान्ह'))
    : (hours24 >= 4 ? 'बिहान' : 'राती');

  const displayHours = hours24 % 12 || 12;
  const displayHoursStr = String(displayHours).padStart(2, '0');

  // 12-Hour format (HH:MM:SS AM/PM)
  const hhMmSsEn = `${displayHoursStr}:${minutes}:${seconds} ${ampmEn}`;
  const hhMmSsNp = `${toNepaliDigits(displayHoursStr)}:${toNepaliDigits(minutes)}:${toNepaliDigits(seconds)} ${ampmNp}`;

  const time12En = `${displayHoursStr}:${minutes}:${seconds} ${ampmEn}`;
  const time12Np = `${toNepaliDigits(displayHoursStr)}:${toNepaliDigits(minutes)}:${toNepaliDigits(seconds)} ${ampmNp}`;

  const timeOnlyEn = `${displayHoursStr}:${minutes}:${seconds} ${ampmEn} NPT`;
  const timeOnlyNp = `${toNepaliDigits(displayHoursStr)}:${toNepaliDigits(minutes)}:${toNepaliDigits(seconds)} ${ampmNp} (नेपाल समय)`;

  // Bikram Sambat date requested: 2083/06/21 (Ashwin 21, 2083 BS)
  const bsYear = '2083';
  const bsMonth = '06';
  const bsDay = '21';
  const bsDateEn = `${bsYear}/${bsMonth}/${bsDay}`;
  const bsDateNp = `${toNepaliDigits(bsYear)}/${toNepaliDigits(bsMonth)}/${toNepaliDigits(bsDay)}`;

  const ddMmYyEn = `${bsDay}:${bsMonth}:${bsYear.slice(-2)}`;
  const ddMmYyNp = `${toNepaliDigits(bsDay)}:${toNepaliDigits(bsMonth)}:${toNepaliDigits(bsYear.slice(-2))}`;

  const nepaliDay = NEPALI_DAYS[date.getDay()];
  const english = `${dayEn} ${monthEn} ${yearEn} · BS ${bsDateEn}, ${hhMmSsEn} NPT (UTC+5:45)`;
  const nepali = `${nepaliDay}, वि.सं. ${bsDateNp}, ${hhMmSsNp} (नेपाल समय)`;

  return {
    english,
    nepali,
    timeOnlyEn,
    timeOnlyNp,
    time12En,
    time12Np,
    bsDateEn,
    bsDateNp,
    ddMmYyEn,
    ddMmYyNp,
    hhMmSsEn,
    hhMmSsNp,
    nepaliDay,
    rawDate: date
  };
}
