import { forwardRef, useCallback, useId, useRef } from "react";
import { Button, Dialog, Popover } from "react-aria-components";
import { CalendarPanel } from "./calendar";
import { isoDate } from "./date-utils";
import type { DateRangePickerProps } from "./types";
import { useDateRangePicker } from "./use-date-range-picker";

function join(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(function DateRangePicker(
  {
    presets,
    startName,
    endName,
    theme = "system",
    classNames,
    className,
    style,
    id,
    title,
    ...options
  },
  ref
) {
  const controller = useDateRangePicker({ ...options, ...(presets === undefined ? {} : { presets }) });
  const rootRef = useRef<HTMLDivElement>(null);
  const errorId = useId();
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <div
      ref={setRootRef}
      id={id}
      title={title}
      style={style}
      dir={controller.direction}
      className={join("dcr-root", className, classNames?.root)}
      data-theme={theme}
      data-calendar={controller.calendar}
      data-open={controller.isOpen || undefined}
      data-disabled={controller.disabled || undefined}
    >
      <div className={join("dcr-fields", classNames?.fields)}>
        <label className={join("dcr-field", classNames?.field)}>
          <span className="dcr-field__label">{controller.messages.startLabel}</span>
          <input
            className={join("dcr-input", classNames?.input)}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={controller.startText}
            placeholder={controller.messages.startPlaceholder}
            aria-invalid={Boolean(controller.error)}
            aria-describedby={controller.error ? errorId : undefined}
            disabled={controller.disabled}
            readOnly={controller.readOnly}
            onChange={(event) => controller.setStartText(event.target.value)}
            onBlur={controller.parseStart}
            onKeyDown={(event) => {
              if (event.key === "Enter") controller.parseStart();
              if (event.key === "ArrowDown" && event.altKey) controller.setOpen(true);
              if (event.key === "Escape") controller.cancel();
            }}
          />
        </label>
        <span className={join("dcr-separator", classNames?.separator)} aria-hidden="true">
          <Arrow direction={controller.direction} />
        </span>
        <label className={join("dcr-field", classNames?.field)}>
          <span className="dcr-field__label">{controller.messages.endLabel}</span>
          <input
            className={join("dcr-input", classNames?.input)}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={controller.endText}
            placeholder={controller.messages.endPlaceholder}
            aria-invalid={Boolean(controller.error)}
            aria-describedby={controller.error ? errorId : undefined}
            disabled={controller.disabled}
            readOnly={controller.readOnly}
            onChange={(event) => controller.setEndText(event.target.value)}
            onBlur={controller.parseEnd}
            onKeyDown={(event) => {
              if (event.key === "Enter") controller.parseEnd();
              if (event.key === "ArrowDown" && event.altKey) controller.setOpen(true);
              if (event.key === "Escape") controller.cancel();
            }}
          />
        </label>
        <Button
          className={join("dcr-trigger", classNames?.trigger)}
          aria-label={controller.messages.openCalendar}
          aria-expanded={controller.isOpen}
          isDisabled={controller.disabled || controller.readOnly}
          onPress={() => controller.setOpen(!controller.isOpen)}
        >
          <CalendarIcon />
        </Button>
      </div>

      {controller.error ? (
        <p id={errorId} role="alert" className={join("dcr-error", classNames?.error)}>
          {controller.error}
        </p>
      ) : null}

      {startName ? (
        <input
          type="hidden"
          name={startName}
          value={controller.committedValue ? isoDate(controller.committedValue.start, controller.timeZone) : ""}
        />
      ) : null}
      {endName ? (
        <input
          type="hidden"
          name={endName}
          value={controller.committedValue ? isoDate(controller.committedValue.end, controller.timeZone) : ""}
        />
      ) : null}

      <Popover
        triggerRef={rootRef}
        isOpen={controller.isOpen}
        onOpenChange={controller.setOpen}
        placement="bottom start"
        offset={10}
        data-theme={theme}
        data-calendar={controller.calendar}
        dir={controller.direction}
        className={join("dcr-popover", classNames?.popover)}
      >
        <Dialog aria-label={controller.messages.calendarDialog} className={join("dcr-dialog", classNames?.dialog)}>
          <div className={join("dcr-layout", classNames?.layout)}>
            {controller.presets.length ? (
              <nav className={join("dcr-presets", classNames?.presets)} aria-label={controller.messages.calendarDialog}>
                {controller.presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={join("dcr-preset", classNames?.preset)}
                    onClick={() => controller.selectPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </nav>
            ) : null}
            <CalendarPanel
              controller={controller}
              classNames={classNames}
              responsive
              {...(options.minDate ? { minDate: options.minDate } : {})}
              {...(options.maxDate ? { maxDate: options.maxDate } : {})}
              onRangeChange={controller.selectRange}
            />
          </div>
          {controller.error ? (
            <p role="alert" className={join("dcr-error", "dcr-dialog__error", classNames?.error)}>
              {controller.error}
            </p>
          ) : null}
          <footer className={join("dcr-actions", classNames?.actions)}>
            <button
              type="button"
              className={join("dcr-action dcr-action--quiet dcr-action--clear", classNames?.actionButton)}
              onClick={controller.clear}
            >
              {controller.messages.clear}
            </button>
            <span className="dcr-actions__spacer" />
            <button
              type="button"
              className={join("dcr-action dcr-action--secondary dcr-action--cancel", classNames?.actionButton)}
              onClick={controller.cancel}
            >
              {controller.messages.cancel}
            </button>
            <button
              type="button"
              className={join("dcr-action dcr-action--primary dcr-action--apply", classNames?.actionButton)}
              disabled={!controller.canApply}
              onClick={controller.apply}
            >
              {controller.messages.apply}
            </button>
          </footer>
        </Dialog>
      </Popover>
    </div>
  );
});

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M7 3v3m10-3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

function Arrow({ direction }: { direction: "rtl" | "ltr" }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d={direction === "rtl" ? "M14 10H6m3-3-3 3 3 3" : "M6 10h8m-3-3 3 3-3 3"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
