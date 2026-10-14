import { forwardRef, useId } from "react";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  I18nProvider,
  RangeCalendar as AriaRangeCalendar,
  type RangeValue
} from "react-aria-components";
import { CalendarDate, type DateValue } from "@internationalized/date";
import {
  calendarInstance,
  dateToCalendarDate,
  localeWithCalendar,
  localizeDigits
} from "./date-utils";
import type { RangeCalendarProps, SlotClassNames, Theme } from "./types";
import { useDateRangePicker, type DateRangePickerController } from "./use-date-range-picker";

function join(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}

function useResponsiveMonths(enabled: boolean, requested?: 1 | 2): 1 | 2 {
  if (requested) return requested;
  return 1;
}

function monthNames(controller: DateRangePickerController, year: number): string[] {
  const formatter = new Intl.DateTimeFormat(localeWithCalendar(controller.locale, controller.calendar), {
    month: "long",
    timeZone: controller.timeZone
  });
  return Array.from({ length: 12 }, (_, index) => {
    const date = new CalendarDate(
      calendarInstance(controller.calendar),
      year,
      index + 1,
      1
    );
    return formatter.format(date.toDate(controller.timeZone));
  });
}

interface CalendarPanelProps {
  controller: DateRangePickerController;
  classNames?: SlotClassNames | undefined;
  visibleMonths?: 1 | 2;
  responsive?: boolean;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  minDate?: Date;
  maxDate?: Date;
  onRangeChange: (value: RangeValue<DateValue> | null) => void;
}

export function CalendarPanel({
  controller,
  classNames,
  visibleMonths: requestedMonths,
  responsive = true,
  firstDayOfWeek,
  minDate,
  maxDate,
  onRangeChange
}: CalendarPanelProps) {
  const selectId = useId().replace(/:/g, "");
  const visibleMonths = useResponsiveMonths(responsive, requestedMonths);
  const value = controller.toCalendarRange(controller.draftValue);
  const minValue = minDate
    ? dateToCalendarDate(minDate, controller.calendar, controller.timeZone)
    : undefined;
  const maxValue = maxDate
    ? dateToCalendarDate(maxDate, controller.calendar, controller.timeZone)
    : undefined;

  return (
    <I18nProvider locale={localeWithCalendar(controller.locale, controller.calendar)}>
      <AriaRangeCalendar
        aria-label={controller.messages.calendarDialog}
        className={join("dcr-calendar", classNames?.calendar)}
        value={value}
        onChange={onRangeChange}
        visibleDuration={{ months: visibleMonths }}
        createCalendar={() => calendarInstance(controller.calendar)}
        isDateUnavailable={controller.isDateUnavailable}
        allowsNonContiguousRanges={false}
        {...(minValue ? { minValue } : {})}
        {...(maxValue ? { maxValue } : {})}
        {...(firstDayOfWeek ? { firstDayOfWeek } : {})}
      >
        {({ state }) => {
          const focused = state.focusedDate;
          const months = monthNames(controller, focused.year);
          const currentYear = dateToCalendarDate(new Date(), controller.calendar, controller.timeZone).year;
          const minimumYear = Math.min(minValue?.year ?? currentYear - 100, focused.year);
          const maximumYear = Math.max(maxValue?.year ?? currentYear + 20, focused.year);
          const years = Array.from({ length: maximumYear - minimumYear + 1 }, (_, index) => minimumYear + index);
          return (
            <>
              <header className={join("dcr-calendar__header", classNames?.header)}>
                <Button
                  slot="previous"
                  className={join("dcr-calendar__nav", classNames?.navButton)}
                  aria-label={controller.messages.previousMonth}
                >
                  <Chevron direction={controller.direction === "rtl" ? "right" : "left"} />
                </Button>
                <div className="dcr-calendar__selectors">
                  <label className="dcr-sr-only" htmlFor={`dcr-month-${selectId}`}>
                    {controller.messages.monthLabel}
                  </label>
                  <select
                    id={`dcr-month-${selectId}`}
                    className={join("dcr-calendar__select", classNames?.select)}
                    value={focused.month}
                    onChange={(event) => state.setFocusedDate(focused.set({ month: Number(event.target.value) }))}
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <label className="dcr-sr-only" htmlFor={`dcr-year-${selectId}`}>
                    {controller.messages.yearLabel}
                  </label>
                  <select
                    id={`dcr-year-${selectId}`}
                    className={join("dcr-calendar__select", classNames?.select)}
                    value={focused.year}
                    onChange={(event) => state.setFocusedDate(focused.set({ year: Number(event.target.value) }))}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {localizeDigits(String(year), controller.locale)}
                      </option>
                    ))}
                  </select>
                </div>
                <Heading className={join("dcr-sr-only", classNames?.heading)} />
                <Button
                  slot="next"
                  className={join("dcr-calendar__nav", classNames?.navButton)}
                  aria-label={controller.messages.nextMonth}
                >
                  <Chevron direction={controller.direction === "rtl" ? "left" : "right"} />
                </Button>
              </header>
              <div className={join("dcr-calendar__grids", classNames?.grids)} data-months={visibleMonths}>
                {Array.from({ length: visibleMonths }, (_, index) => {
                  const monthDate = state.visibleRange.start.add({ months: index });
                  const monthTitle = new Intl.DateTimeFormat(
                    localeWithCalendar(controller.locale, controller.calendar),
                    { month: "long", year: "numeric", timeZone: controller.timeZone }
                  ).format(monthDate.toDate(controller.timeZone));
                  return (
                    <div className="dcr-calendar__month" key={index}>
                      {visibleMonths > 1 ? (
                        <div className={join("dcr-calendar__month-title", classNames?.heading)}>{monthTitle}</div>
                      ) : null}
                      <CalendarGrid
                        offset={{ months: index }}
                        weekdayStyle="narrow"
                        className={join("dcr-calendar__grid", classNames?.grid)}
                      >
                        <CalendarGridHeader>
                          {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
                        </CalendarGridHeader>
                        <CalendarGridBody>
                          {(date) => (
                            <CalendarCell
                              date={date}
                              className={join("dcr-calendar__cell", classNames?.cell)}
                            />
                          )}
                        </CalendarGridBody>
                      </CalendarGrid>
                    </div>
                  );
                })}
              </div>
            </>
          );
        }}
      </AriaRangeCalendar>
    </I18nProvider>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d={direction === "left" ? "M12.5 15 7.5 10l5-5" : "m7.5 15 5-5-5-5"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export const RangeCalendar = forwardRef<HTMLDivElement, RangeCalendarProps>(function RangeCalendar(
  {
    visibleMonths,
    responsive = true,
    firstDayOfWeek,
    theme = "system",
    classNames,
    className,
    style,
    id,
    ...options
  },
  ref
) {
  const controller = useDateRangePicker({ ...options, presets: false });
  return (
    <div
      ref={ref}
      id={id}
      style={style}
      dir={controller.direction}
      className={join("dcr-root", "dcr-inline", className, classNames?.root)}
      data-theme={theme}
      data-calendar={controller.calendar}
    >
      <CalendarPanel
        controller={controller}
        classNames={classNames}
        responsive={responsive}
        {...(visibleMonths ? { visibleMonths } : {})}
        {...(firstDayOfWeek ? { firstDayOfWeek } : {})}
        {...(options.minDate ? { minDate: options.minDate } : {})}
        {...(options.maxDate ? { maxDate: options.maxDate } : {})}
        onRangeChange={controller.commitRange}
      />
      {controller.error ? (
        <p className={join("dcr-error", classNames?.error)} role="alert">
          {controller.error}
        </p>
      ) : null}
    </div>
  );
});

export function themeAttribute(theme: Theme): Theme {
  return theme;
}
