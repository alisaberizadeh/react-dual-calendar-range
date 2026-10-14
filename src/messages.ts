import type { DateRangePickerMessages, SupportedLocale } from "./types";

const fa: DateRangePickerMessages = {
  startLabel: "تاریخ شروع",
  endLabel: "تاریخ پایان",
  startPlaceholder: "شروع",
  endPlaceholder: "پایان",
  openCalendar: "باز کردن تقویم",
  calendarDialog: "انتخاب بازه تاریخ",
  apply: "اعمال",
  cancel: "انصراف",
  clear: "پاک کردن",
  today: "امروز",
  lastSevenDays: "۷ روز اخیر",
  currentMonth: "ماه جاری",
  previousMonth: "ماه قبل",
  nextMonth: "ماه بعد",
  monthLabel: "ماه",
  yearLabel: "سال",
  invalidDate: "تاریخ واردشده معتبر نیست.",
  incompleteRange: "هر دو تاریخ شروع و پایان را وارد کنید.",
  required: "انتخاب بازه تاریخ الزامی است.",
  invalidOrder: "تاریخ پایان باید بعد از تاریخ شروع باشد.",
  disabledDate: "این بازه شامل تاریخ غیرمجاز است.",
  minDays: (days) => `بازه باید حداقل ${days} روز باشد.`,
  maxDays: (days) => `بازه نمی‌تواند بیشتر از ${days} روز باشد.`
};

const en: DateRangePickerMessages = {
  startLabel: "Start date",
  endLabel: "End date",
  startPlaceholder: "Start",
  endPlaceholder: "End",
  openCalendar: "Open calendar",
  calendarDialog: "Choose a date range",
  apply: "Apply",
  cancel: "Cancel",
  clear: "Clear",
  today: "Today",
  lastSevenDays: "Last 7 days",
  currentMonth: "This month",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  monthLabel: "Month",
  yearLabel: "Year",
  invalidDate: "Enter a valid date.",
  incompleteRange: "Enter both a start and an end date.",
  required: "A date range is required.",
  invalidOrder: "The end date must be on or after the start date.",
  disabledDate: "This range contains an unavailable date.",
  minDays: (days) => `The range must be at least ${days} days.`,
  maxDays: (days) => `The range cannot exceed ${days} days.`
};

export function getMessages(
  locale: SupportedLocale,
  overrides?: Partial<DateRangePickerMessages>
): DateRangePickerMessages {
  return { ...(locale === "fa-IR" ? fa : en), ...overrides };
}
