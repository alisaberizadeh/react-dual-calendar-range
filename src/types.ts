import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type CalendarSystem = "jalali" | "gregorian";
export type SupportedLocale = "fa-IR" | "en-US";
export type DateFormat = "yyyy/MM/dd" | "MM/dd/yyyy" | "dd/MM/yyyy";
export type Direction = "rtl" | "ltr" | "auto";
export type Theme = "light" | "dark" | "system";

export interface DateRange {
  start: Date;
  end: Date;
}

export type DateRangeValue = DateRange | null;

export interface PresetContext {
  calendar: CalendarSystem;
  locale: SupportedLocale;
  timeZone: string;
  today: Date;
}

export interface DatePreset {
  id: string;
  label: string;
  getValue: (context: PresetContext) => DateRange;
}

export interface DateRangePickerMessages {
  startLabel: string;
  endLabel: string;
  startPlaceholder: string;
  endPlaceholder: string;
  openCalendar: string;
  calendarDialog: string;
  apply: string;
  cancel: string;
  clear: string;
  today: string;
  lastSevenDays: string;
  currentMonth: string;
  previousMonth: string;
  nextMonth: string;
  monthLabel: string;
  yearLabel: string;
  invalidDate: string;
  incompleteRange: string;
  required: string;
  invalidOrder: string;
  disabledDate: string;
  minDays: (days: number) => string;
  maxDays: (days: number) => string;
}

export type DateRangePickerSlot =
  | "root"
  | "fields"
  | "field"
  | "input"
  | "separator"
  | "trigger"
  | "popover"
  | "dialog"
  | "layout"
  | "presets"
  | "preset"
  | "calendar"
  | "header"
  | "heading"
  | "navButton"
  | "select"
  | "grids"
  | "grid"
  | "cell"
  | "error"
  | "actions"
  | "actionButton";

export type SlotClassNames = Partial<Record<DateRangePickerSlot, string>>;

export interface SharedDateRangeOptions {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  calendar?: CalendarSystem;
  locale?: SupportedLocale;
  direction?: Direction;
  timeZone?: string;
  minDate?: Date;
  maxDate?: Date;
  minDays?: number;
  maxDays?: number;
  isDateDisabled?: (date: Date) => boolean;
  dateFormat?: DateFormat;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  messages?: Partial<DateRangePickerMessages>;
}

export interface DateRangePickerProps
  extends SharedDateRangeOptions,
    Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> {
  presets?: false | DatePreset[];
  startName?: string;
  endName?: string;
  theme?: Theme;
  classNames?: SlotClassNames;
}

export interface RangeCalendarProps
  extends SharedDateRangeOptions,
    Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> {
  visibleMonths?: 1 | 2;
  responsive?: boolean;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  theme?: Theme;
  classNames?: SlotClassNames;
}

export interface PrimitiveProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
