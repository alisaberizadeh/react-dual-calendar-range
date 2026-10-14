import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "react-aria-components";
import {
  addLocalDays,
  calendarDateToDate,
  calendarRangeToRange,
  cloneRange,
  compareDates,
  currentCalendarMonthRange,
  defaultDateFormat,
  formatDate,
  parseDate,
  rangeToCalendarRange,
  resolveDirection,
  resolveLocale,
  resolveTimeZone,
  todayInZone,
  validateRange
} from "./date-utils";
import { getMessages } from "./messages";
import type {
  DatePreset,
  DateRange,
  DateRangeValue,
  SharedDateRangeOptions
} from "./types";

export interface UseDateRangePickerOptions extends SharedDateRangeOptions {
  presets?: false | DatePreset[];
}

export interface DateRangePickerController {
  calendar: "jalali" | "gregorian";
  locale: "fa-IR" | "en-US";
  direction: "rtl" | "ltr";
  timeZone: string;
  dateFormat: "yyyy/MM/dd" | "MM/dd/yyyy" | "dd/MM/yyyy";
  messages: ReturnType<typeof getMessages>;
  committedValue: DateRangeValue;
  draftValue: DateRangeValue;
  startText: string;
  endText: string;
  error: string | null;
  isOpen: boolean;
  canApply: boolean;
  presets: DatePreset[];
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  setOpen: (open: boolean) => void;
  setStartText: (value: string) => void;
  setEndText: (value: string) => void;
  parseStart: () => void;
  parseEnd: () => void;
  selectRange: (value: RangeValue<DateValue> | null) => void;
  commitRange: (value: RangeValue<DateValue> | null) => boolean;
  selectPreset: (preset: DatePreset) => void;
  clear: () => void;
  apply: () => boolean;
  cancel: () => void;
  toCalendarRange: (value: DateRangeValue) => ReturnType<typeof rangeToCalendarRange>;
  isDateUnavailable: (value: DateValue) => boolean;
}

function useControllableRange(options: UseDateRangePickerOptions) {
  const controlled = options.value !== undefined;
  const [internalValue, setInternalValue] = useState<DateRangeValue>(() => cloneRange(options.defaultValue ?? null));
  const value = controlled ? options.value ?? null : internalValue;

  const change = useCallback(
    (next: DateRangeValue) => {
      if (!controlled) setInternalValue(cloneRange(next));
      options.onChange?.(cloneRange(next));
    },
    [controlled, options.onChange]
  );

  return [value, change] as const;
}

export function useDateRangePicker(options: UseDateRangePickerOptions = {}): DateRangePickerController {
  const calendar = options.calendar ?? "jalali";
  const locale = resolveLocale(calendar, options.locale);
  const direction = resolveDirection(locale, options.direction);
  const timeZone = resolveTimeZone(options.timeZone);
  const dateFormat = options.dateFormat ?? defaultDateFormat(locale);
  const messages = useMemo(() => getMessages(locale, options.messages), [locale, options.messages]);
  const [committedValue, changeCommittedValue] = useControllableRange(options);
  const [draftStart, setDraftStart] = useState<Date | null>(() => committedValue?.start ?? null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(() => committedValue?.end ?? null);
  const [startText, setStartTextState] = useState(() =>
    formatDate(committedValue?.start ?? null, { calendar, locale, timeZone, format: dateFormat })
  );
  const [endText, setEndTextState] = useState(() =>
    formatDate(committedValue?.end ?? null, { calendar, locale, timeZone, format: dateFormat })
  );
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const draftValue: DateRangeValue = draftStart && draftEnd ? { start: draftStart, end: draftEnd } : null;

  const syncDraft = useCallback(
    (value: DateRangeValue) => {
      setDraftStart(value?.start ?? null);
      setDraftEnd(value?.end ?? null);
      setStartTextState(formatDate(value?.start ?? null, { calendar, locale, timeZone, format: dateFormat }));
      setEndTextState(formatDate(value?.end ?? null, { calendar, locale, timeZone, format: dateFormat }));
      setStartError(null);
      setEndError(null);
      setValidationError(null);
    },
    [calendar, dateFormat, locale, timeZone]
  );

  useEffect(() => {
    if (!isOpen) syncDraft(committedValue);
  }, [calendar, committedValue, dateFormat, isOpen, locale, syncDraft, timeZone]);

  const validation = useMemo(
    () =>
      draftStart && draftEnd
        ? validateRange(
            { start: draftStart, end: draftEnd },
            {
              ...(options.required === undefined ? {} : { required: options.required }),
              ...(options.minDate === undefined ? {} : { minDate: options.minDate }),
              ...(options.maxDate === undefined ? {} : { maxDate: options.maxDate }),
              ...(options.minDays === undefined ? {} : { minDays: options.minDays }),
              ...(options.maxDays === undefined ? {} : { maxDays: options.maxDays }),
              ...(options.isDateDisabled === undefined ? {} : { isDateDisabled: options.isDateDisabled }),
              timeZone,
              messages
            }
          )
        : draftStart || draftEnd
          ? messages.incompleteRange
          : options.required
            ? messages.required
            : null,
    [draftEnd, draftStart, messages, options.isDateDisabled, options.maxDate, options.maxDays, options.minDate, options.minDays, options.required, timeZone]
  );

  const error = startError ?? endError ?? validationError ?? (draftStart && draftEnd ? validation : null);
  const canApply = !options.disabled && !options.readOnly && !startError && !endError && !validation;

  const setOpen = useCallback(
    (open: boolean) => {
      if (options.disabled || options.readOnly) return;
      if (!open) syncDraft(committedValue);
      setIsOpen(open);
    },
    [committedValue, options.disabled, options.readOnly, syncDraft]
  );

  const setStartText = useCallback((value: string) => {
    setStartTextState(value);
    setStartError(null);
    setValidationError(null);
  }, []);

  const setEndText = useCallback((value: string) => {
    setEndTextState(value);
    setEndError(null);
    setValidationError(null);
  }, []);

  const parseStart = useCallback(() => {
    if (!startText.trim()) {
      setDraftStart(null);
      setStartError(null);
      return;
    }
    const parsed = parseDate(startText, { calendar, timeZone, format: dateFormat });
    if (!parsed) {
      setStartError(messages.invalidDate);
      return;
    }
    setDraftStart(parsed);
    setStartTextState(formatDate(parsed, { calendar, locale, timeZone, format: dateFormat }));
    setStartError(null);
    setValidationError(null);
  }, [calendar, dateFormat, locale, messages.invalidDate, startText, timeZone]);

  const parseEnd = useCallback(() => {
    if (!endText.trim()) {
      setDraftEnd(null);
      setEndError(null);
      return;
    }
    const parsed = parseDate(endText, { calendar, timeZone, format: dateFormat });
    if (!parsed) {
      setEndError(messages.invalidDate);
      return;
    }
    setDraftEnd(parsed);
    setEndTextState(formatDate(parsed, { calendar, locale, timeZone, format: dateFormat }));
    setEndError(null);
    setValidationError(null);
  }, [calendar, dateFormat, endText, locale, messages.invalidDate, timeZone]);

  const selectRange = useCallback(
    (value: RangeValue<DateValue> | null) => {
      const converted = calendarRangeToRange(value, timeZone);
      setDraftStart(converted?.start ?? null);
      setDraftEnd(converted?.end ?? null);
      setStartTextState(formatDate(converted?.start ?? null, { calendar, locale, timeZone, format: dateFormat }));
      setEndTextState(formatDate(converted?.end ?? null, { calendar, locale, timeZone, format: dateFormat }));
      setStartError(null);
      setEndError(null);
      setValidationError(null);
    },
    [calendar, dateFormat, locale, timeZone]
  );

  const commitRange = useCallback(
    (value: RangeValue<DateValue> | null) => {
      const converted = calendarRangeToRange(value, timeZone);
      const nextError = validateRange(converted, {
        ...(options.required === undefined ? {} : { required: options.required }),
        ...(options.minDate === undefined ? {} : { minDate: options.minDate }),
        ...(options.maxDate === undefined ? {} : { maxDate: options.maxDate }),
        ...(options.minDays === undefined ? {} : { minDays: options.minDays }),
        ...(options.maxDays === undefined ? {} : { maxDays: options.maxDays }),
        ...(options.isDateDisabled === undefined ? {} : { isDateDisabled: options.isDateDisabled }),
        timeZone,
        messages
      });
      selectRange(value);
      if (nextError) {
        setValidationError(nextError);
        return false;
      }
      changeCommittedValue(converted);
      return true;
    },
    [changeCommittedValue, messages, options.isDateDisabled, options.maxDate, options.maxDays, options.minDate, options.minDays, options.required, selectRange, timeZone]
  );

  const clear = useCallback(() => {
    setDraftStart(null);
    setDraftEnd(null);
    setStartTextState("");
    setEndTextState("");
    setStartError(null);
    setEndError(null);
    setValidationError(null);
  }, []);

  const apply = useCallback(() => {
    if (startError || endError) return false;
    if (validation) {
      setValidationError(validation);
      return false;
    }
    const next = draftStart && draftEnd ? { start: draftStart, end: draftEnd } : null;
    changeCommittedValue(next);
    setIsOpen(false);
    return true;
  }, [changeCommittedValue, draftEnd, draftStart, endError, startError, validation]);

  const cancel = useCallback(() => {
    syncDraft(committedValue);
    setIsOpen(false);
  }, [committedValue, syncDraft]);

  const today = useMemo(() => todayInZone(timeZone), [timeZone]);
  const defaultPresets = useMemo<DatePreset[]>(
    () => [
      {
        id: "today",
        label: messages.today,
        getValue: ({ today: current }) => ({ start: current, end: current })
      },
      {
        id: "last-seven-days",
        label: messages.lastSevenDays,
        getValue: ({ today: current }) => ({
          start: addLocalDays(current, -6, timeZone),
          end: current
        })
      },
      {
        id: "current-month",
        label: messages.currentMonth,
        getValue: ({ today: current, calendar: system, timeZone: zone }) =>
          currentCalendarMonthRange(current, system, zone)
      }
    ],
    [messages.currentMonth, messages.lastSevenDays, messages.today, timeZone]
  );
  const presets = options.presets === false ? [] : options.presets ?? defaultPresets;

  const selectPreset = useCallback(
    (preset: DatePreset) => {
      const value = preset.getValue({ calendar, locale, timeZone, today });
      selectRange(rangeToCalendarRange(value, calendar, timeZone));
    },
    [calendar, locale, selectRange, timeZone, today]
  );

  const isDateUnavailable = useCallback(
    (value: DateValue) => {
      const date = calendarDateToDate(value, timeZone);
      return Boolean(
        (options.minDate && compareDates(date, options.minDate, timeZone) < 0) ||
          (options.maxDate && compareDates(date, options.maxDate, timeZone) > 0) ||
          options.isDateDisabled?.(date)
      );
    },
    [options.isDateDisabled, options.maxDate, options.minDate, timeZone]
  );

  const toCalendarRange = useCallback(
    (value: DateRangeValue) => rangeToCalendarRange(value, calendar, timeZone),
    [calendar, timeZone]
  );

  return {
    calendar,
    locale,
    direction,
    timeZone,
    dateFormat,
    messages,
    committedValue,
    draftValue,
    startText,
    endText,
    error,
    isOpen,
    canApply,
    presets,
    disabled: options.disabled ?? false,
    readOnly: options.readOnly ?? false,
    required: options.required ?? false,
    setOpen,
    setStartText,
    setEndText,
    parseStart,
    parseEnd,
    selectRange,
    commitRange,
    selectPreset,
    clear,
    apply,
    cancel,
    toCalendarRange,
    isDateUnavailable
  };
}
