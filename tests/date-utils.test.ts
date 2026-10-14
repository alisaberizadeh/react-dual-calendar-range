import { describe, expect, it } from "vitest";
import {
  currentCalendarMonthRange,
  formatDate,
  normalizeDigits,
  parseDate,
  rangeLength,
  validateRange
} from "../src/date-utils";
import { getMessages } from "../src/messages";

describe("date utilities", () => {
  it("normalizes Persian and Arabic digits", () => {
    expect(normalizeDigits("۱۴۰۳/٠١/۰۱")).toBe("1403/01/01");
  });

  it("converts a Jalali date to Gregorian and back", () => {
    const value = parseDate("۱۴۰۳/۰۱/۰۱", {
      calendar: "jalali",
      timeZone: "UTC",
      format: "yyyy/MM/dd"
    });

    expect(value).not.toBeNull();
    expect(value?.toISOString().slice(0, 10)).toBe("2024-03-20");
    expect(
      formatDate(value, {
        calendar: "jalali",
        locale: "fa-IR",
        timeZone: "UTC",
        format: "yyyy/MM/dd"
      })
    ).toBe("۱۴۰۳/۰۱/۰۱");
  });

  it("rejects impossible Jalali and Gregorian dates", () => {
    expect(
      parseDate("1402/12/30", { calendar: "jalali", timeZone: "UTC", format: "yyyy/MM/dd" })
    ).toBeNull();
    expect(
      parseDate("02/30/2026", { calendar: "gregorian", timeZone: "UTC", format: "MM/dd/yyyy" })
    ).toBeNull();
  });

  it("calculates inclusive range lengths across DST-safe date parts", () => {
    expect(rangeLength({ start: new Date(2026, 2, 20), end: new Date(2026, 2, 26) })).toBe(7);
  });

  it("calculates by the requested timezone rather than the host timezone", () => {
    const start = parseDate("2026/03/20", {
      calendar: "gregorian",
      timeZone: "Asia/Tehran",
      format: "yyyy/MM/dd"
    });
    const end = parseDate("2026/03/26", {
      calendar: "gregorian",
      timeZone: "Asia/Tehran",
      format: "yyyy/MM/dd"
    });
    expect(start && end ? rangeLength({ start, end }, "Asia/Tehran") : 0).toBe(7);
  });

  it("validates length and unavailable days", () => {
    const messages = getMessages("en-US");
    const range = { start: new Date(2026, 9, 10), end: new Date(2026, 9, 12) };

    expect(validateRange(range, { minDays: 4, messages })).toBe("The range must be at least 4 days.");
    expect(
      validateRange(range, {
        isDateDisabled: (date) => date.getDate() === 11,
        messages
      })
    ).toBe(messages.disabledDate);
  });

  it("uses the active calendar when calculating current month", () => {
    const range = currentCalendarMonthRange(new Date("2024-03-25T00:00:00Z"), "jalali", "UTC");
    expect(range.start.toISOString().slice(0, 10)).toBe("2024-03-20");
    expect(range.end.toISOString().slice(0, 10)).toBe("2024-04-19");
  });
});
