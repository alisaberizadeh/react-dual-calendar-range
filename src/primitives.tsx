import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode
} from "react";
import { Dialog, Modal, ModalOverlay, type DialogProps } from "react-aria-components";
import { CalendarPanel } from "./calendar";
import { useDateRangePicker, type DateRangePickerController, type UseDateRangePickerOptions } from "./use-date-range-picker";

const Context = createContext<DateRangePickerController | null>(null);

export function useDateRangeContext(): DateRangePickerController {
  const value = useContext(Context);
  if (!value) throw new Error("Date range primitives must be rendered inside <DateRangeRoot>.");
  return value;
}

export interface DateRangeRootProps
  extends UseDateRangePickerOptions,
    Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange" | "dir"> {
  children: ReactNode | ((controller: DateRangePickerController) => ReactNode);
}

export const DateRangeRoot = forwardRef<HTMLDivElement, DateRangeRootProps>(function DateRangeRoot(
  { children, className, id, style, role, tabIndex, onKeyDown, onFocus, onBlur, ...options },
  ref
) {
  const controller = useDateRangePicker(options);
  return (
    <Context.Provider value={controller}>
      <div
        ref={ref}
        id={id}
        style={style}
        role={role}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={className}
        dir={controller.direction}
        data-calendar={controller.calendar}
        data-locale={controller.locale}
        data-open={controller.isOpen || undefined}
        data-disabled={controller.disabled || undefined}
      >
        {typeof children === "function" ? children(controller) : children}
      </div>
    </Context.Provider>
  );
});

export interface DateRangeFieldsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const DateRangeFields = forwardRef<HTMLDivElement, DateRangeFieldsProps>(function DateRangeFields(
  { children, ...props },
  ref
) {
  const state = useDateRangeContext();
  const errorId = useId();
  return (
    <div {...props} ref={ref} data-slot="fields">
      {children ?? (
        <>
          <label>
            <span>{state.messages.startLabel}</span>
            <DateRangeInput field="start" aria-describedby={state.error ? errorId : undefined} />
          </label>
          <span aria-hidden="true">–</span>
          <label>
            <span>{state.messages.endLabel}</span>
            <DateRangeInput field="end" aria-describedby={state.error ? errorId : undefined} />
          </label>
          {state.error ? (
            <span id={errorId} role="alert">
              {state.error}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
});

export interface DateRangeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  field: "start" | "end";
}

export const DateRangeInput = forwardRef<HTMLInputElement, DateRangeInputProps>(function DateRangeInput(
  { field, onBlur, onKeyDown, ...props },
  ref
) {
  const state = useDateRangeContext();
  const isStart = field === "start";
  const parse = isStart ? state.parseStart : state.parseEnd;
  return (
    <input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={isStart ? state.startText : state.endText}
      placeholder={isStart ? state.messages.startPlaceholder : state.messages.endPlaceholder}
      aria-label={isStart ? state.messages.startLabel : state.messages.endLabel}
      aria-invalid={Boolean(state.error)}
      disabled={state.disabled}
      readOnly={state.readOnly}
      onFocus={() => state.setOpen(true)}
      onChange={(event) => (isStart ? state.setStartText(event.target.value) : state.setEndText(event.target.value))}
      onBlur={(event) => {
        parse();
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") parse();
        if (event.key === "Escape") state.cancel();
        onKeyDown?.(event);
      }}
    />
  );
});

export const DateRangeTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function DateRangeTrigger({ children, onClick, ...props }, ref) {
    const state = useDateRangeContext();
    return (
      <button
        {...props}
        ref={ref}
        type="button"
        aria-label={state.messages.openCalendar}
        aria-expanded={state.isOpen}
        disabled={state.disabled || state.readOnly}
        onClick={(event) => {
          state.setOpen(!state.isOpen);
          onClick?.(event);
        }}
      >
        {children ?? state.messages.openCalendar}
      </button>
    );
  }
);

export const DateRangePopover = forwardRef<HTMLElement, DialogProps>(
  function DateRangePopover({ children, ...props }, ref) {
    const state = useDateRangeContext();
    return (
      <ModalOverlay isOpen={state.isOpen} onOpenChange={state.setOpen} isDismissable>
        <Modal>
          <Dialog
            {...props}
            ref={ref}
            aria-label={state.messages.calendarDialog}
            data-slot="popover"
          >
            {children}
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }
);

function structuralPrimitive(slot: string) {
  return forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Primitive({ children, ...props }, ref) {
    return (
      <div {...props} ref={ref} data-slot={slot}>
        {children}
      </div>
    );
  });
}

export interface DateRangeCalendarProps extends HTMLAttributes<HTMLDivElement> {
  visibleMonths?: 1 | 2;
  responsive?: boolean;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
}

export const DateRangeCalendar = forwardRef<HTMLDivElement, DateRangeCalendarProps>(function DateRangeCalendar(
  { visibleMonths, responsive = true, firstDayOfWeek, className, ...props },
  ref
) {
  const state = useDateRangeContext();
  return (
    <div {...props} ref={ref} className={className} data-slot="calendar">
      <CalendarPanel
        controller={state}
        responsive={responsive}
        {...(visibleMonths ? { visibleMonths } : {})}
        {...(firstDayOfWeek ? { firstDayOfWeek } : {})}
        onRangeChange={state.selectRange}
      />
    </div>
  );
});
export const DateRangeHeader = structuralPrimitive("header");
export const DateRangeGrid = structuralPrimitive("grid");
export const DateRangeCell = structuralPrimitive("cell");

export const DateRangePresets = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DateRangePresets({ children, ...props }, ref) {
    const state = useDateRangeContext();
    return (
      <div {...props} ref={ref} data-slot="presets">
        {children ??
          state.presets.map((preset) => (
            <button key={preset.id} type="button" onClick={() => state.selectPreset(preset)}>
              {preset.label}
            </button>
          ))}
      </div>
    );
  }
);

export const DateRangeActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DateRangeActions({ children, ...props }, ref) {
    const state = useDateRangeContext();
    return (
      <div {...props} ref={ref} data-slot="actions">
        {children ?? (
          <>
            <button type="button" onClick={state.clear}>
              {state.messages.clear}
            </button>
            <button type="button" onClick={state.cancel}>
              {state.messages.cancel}
            </button>
            <button type="button" disabled={!state.canApply} onClick={state.apply}>
              {state.messages.apply}
            </button>
          </>
        )}
      </div>
    );
  }
);

export const DateRangePickerPrimitive = {
  Root: DateRangeRoot,
  Fields: DateRangeFields,
  Input: DateRangeInput,
  Trigger: DateRangeTrigger,
  Popover: DateRangePopover,
  Calendar: DateRangeCalendar,
  Header: DateRangeHeader,
  Grid: DateRangeGrid,
  Cell: DateRangeCell,
  Presets: DateRangePresets,
  Actions: DateRangeActions
};
