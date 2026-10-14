import {
  CalendarDate,
  GregorianCalendar,
  PersianCalendar,
  fromDate,
  getLocalTimeZone,
  toCalendar,
  today as internationalizedToday,
  type Calendar,
  type DateValue
} from "@internationalized/date";
import type { RangeValue } from "react-aria-components";
import type {
  CalendarSystem,
  DateFormat,
  DateRange,
  DateRangePickerMessages,
  DateRangeValue,
  SupportedLocale
} from "./types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function resolveLocale(
  calendar: CalendarSystem,
  locale?: SupportedLocale
): SupportedLocale {
  return locale ?? (calendar === "jalali" ? "fa-IR" : "en-US");
}

export function resolveDirection(
  locale: SupportedLocale,
  direction: "rtl" | "ltr" | "auto" = "auto"
): "rtl" | "ltr" {
  if (direction !== "auto") return direction;
  return locale === "fa-IR" ? "rtl" : "ltr";
}

export function resolveTimeZone(timeZone?: string): string {
  if (timeZone) return timeZone;
  try {
    return getLocalTimeZone();
  } catch {
    return "UTC";
  }
}

export function calendarInstance(system: CalendarSystem): Calendar {
  return system === "jalali" ? new PersianCalendar() : new GregorianCalendar();
}

export function calendarIdentifier(system: CalendarSystem): "persian" | "gregory" {
  return system === "jalali" ? "persian" : "gregory";
}

export function localeWithCalendar(
  locale: SupportedLocale,
  system: CalendarSystem
): string {
  return `${locale}-u-ca-${calendarIdentifier(system)}`;
}

export function dateToCalendarDate(
  date: Date,
  system: CalendarSystem,
  timeZone: string
): CalendarDate {
  const converted = toCalendar(fromDate(date, timeZone), calendarInstance(system));
  return new CalendarDate(converted.calendar, converted.era, converted.year, converted.month, converted.day);
}

export function calendarDateToDate(value: DateValue, timeZone: string): Date {
  return value.toDate(timeZone);
}

export function rangeToCalendarRange(
  value: DateRangeValue,
  system: CalendarSystem,
  timeZone: string
): RangeValue<CalendarDate> | null {
  if (!value) return null;
  return {
    start: dateToCalendarDate(value.start, system, timeZone),
    end: dateToCalendarDate(value.end, system, timeZone)
  };
}

export function calendarRangeToRange(
  value: RangeValue<DateValue> | null,
  timeZone: string
): DateRangeValue {
  if (!value) return null;
  return {
    start: calendarDateToDate(value.start, timeZone),
    end: calendarDateToDate(value.end, timeZone)
  };
}

export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .trim();
}

export function localizeDigits(value: string, locale: SupportedLocale): string {
  if (locale !== "fa-IR") return value;
  return value.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function defaultDateFormat(locale: SupportedLocale): DateFormat {
  return locale === "fa-IR" ? "yyyy/MM/dd" : "MM/dd/yyyy";
}

function formatParts(format: DateFormat, year: number, month: number, day: number): string {
  const values: Record<string, string> = {
    yyyy: String(year).padStart(4, "0"),
    MM: String(month).padStart(2, "0"),
    dd: String(day).padStart(2, "0")
  };
  return format.replace(/yyyy|MM|dd/g, (token) => values[token] ?? token);
}

export function formatDate(
  date: Date | null,
  options: {
    calendar: CalendarSystem;
    locale: SupportedLocale;
    timeZone: string;
    format: DateFormat;
  }
): string {
  if (!date) return "";
  const calendarDate = dateToCalendarDate(date, options.calendar, options.timeZone);
  return localizeDigits(
    formatParts(options.format, calendarDate.year, calendarDate.month, calendarDate.day),
    options.locale
  );
}

export function parseDate(
  input: string,
  options: {
    calendar: CalendarSystem;
    timeZone: string;
    format: DateFormat;
  }
): Date | null {
  const normalized = normalizeDigits(input);
  const tokens = options.format.split("/");
  const parts = normalized.split("/");
  if (parts.length !== 3 || tokens.length !== 3) return null;

  const values: Partial<Record<"yyyy" | "MM" | "dd", number>> = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] as "yyyy" | "MM" | "dd";
    const part = parts[index];
    if (!part || !/^\d+$/.test(part)) return null;
    values[token] = Number(part);
  }

  const year = values.yyyy;
  const month = values.MM;
  const day = values.dd;
  if (!year || !month || !day || month > 12 || day > 31) return null;

  try {
    const calendar = calendarInstance(options.calendar);
    const date = new CalendarDate(calendar, year, month, day);
    if (date.year !== year || date.month !== month || date.day !== day) return null;
    return date.toDate(options.timeZone);
  } catch {
    return null;
  }
}

function zonedGregorianParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const value = toCalendar(fromDate(date, timeZone), new GregorianCalendar());
  return { year: value.year, month: value.month, day: value.day };
}

export function compareDates(a: Date, b: Date, timeZone = resolveTimeZone()): number {
  const leftParts = zonedGregorianParts(a, timeZone);
  const rightParts = zonedGregorianParts(b, timeZone);
  const left = Date.UTC(leftParts.year, leftParts.month - 1, leftParts.day);
  const right = Date.UTC(rightParts.year, rightParts.month - 1, rightParts.day);
  return Math.sign(left - right);
}

export function rangeLength(range: DateRange, timeZone = resolveTimeZone()): number {
  const startParts = zonedGregorianParts(range.start, timeZone);
  const endParts = zonedGregorianParts(range.end, timeZone);
  const start = Date.UTC(startParts.year, startParts.month - 1, startParts.day);
  const end = Date.UTC(endParts.year, endParts.month - 1, endParts.day);
  return Math.floor((end - start) / 86_400_000) + 1;
}

export function addLocalDays(date: Date, days: number, timeZone = resolveTimeZone()): Date {
  const value = toCalendar(fromDate(date, timeZone), new GregorianCalendar());
  return new CalendarDate(value.year, value.month, value.day).add({ days }).toDate(timeZone);
}

export function cloneRange(value: DateRangeValue): DateRangeValue {
  if (!value) return null;
  return { start: new Date(value.start), end: new Date(value.end) };
}

export function rangesEqual(a: DateRangeValue, b: DateRangeValue): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return compareDates(a.start, b.start) === 0 && compareDates(a.end, b.end) === 0;
}

export function todayInZone(timeZone: string): Date {
  return internationalizedToday(timeZone).toDate(timeZone);
}

export function isoDate(date: Date, timeZone: string): string {
  const value = toCalendar(fromDate(date, timeZone), new GregorianCalendar());
  return `${String(value.year).padStart(4, "0")}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

export function validateRange(
  value: DateRangeValue,
  options: {
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
    minDays?: number;
    maxDays?: number;
    isDateDisabled?: (date: Date) => boolean;
    timeZone?: string;
    messages: DateRangePickerMessages;
  }
): string | null {
  if (!value) return options.required ? options.messages.required : null;
  const timeZone = options.timeZone ?? resolveTimeZone();
  if (compareDates(value.start, value.end, timeZone) > 0) return options.messages.invalidOrder;
  if (options.minDate && compareDates(value.start, options.minDate, timeZone) < 0) return options.messages.disabledDate;
  if (options.maxDate && compareDates(value.end, options.maxDate, timeZone) > 0) return options.messages.disabledDate;

  const length = rangeLength(value, timeZone);
  if (options.minDays && length < options.minDays) return options.messages.minDays(options.minDays);
  if (options.maxDays && length > options.maxDays) return options.messages.maxDays(options.maxDays);

  if (options.isDateDisabled) {
    for (let offset = 0; offset < length; offset += 1) {
      if (options.isDateDisabled(addLocalDays(value.start, offset, timeZone))) return options.messages.disabledDate;
    }
  }
  return null;
}

export function currentCalendarMonthRange(
  date: Date,
  system: CalendarSystem,
  timeZone: string
): DateRange {
  const current = dateToCalendarDate(date, system, timeZone);
  const start = current.set({ day: 1 });
  const end = start.add({ months: 1 }).subtract({ days: 1 });
  return { start: start.toDate(timeZone), end: end.toDate(timeZone) };
}
