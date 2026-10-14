# react-dual-calendar-range

[راهنمای کامل فارسی](./README.fa.md)

An accessible, headless-first Jalali (Persian) and Gregorian date range picker for React 18 and 19.

یک انتخاب‌گر بازه تاریخ شمسی و میلادی برای React، با ظاهر آماده، پشتیبانی کامل RTL و API بدون استایل برای طراحی‌های اختصاصی.

## Features

- Jalali and Gregorian calendars backed by `@internationalized/date`
- Persian/RTL and English/LTR interfaces
- Styled picker, inline calendar, headless hook, and composable primitives
- Two text fields accepting Persian, Arabic, and Latin digits
- Controlled and uncontrolled state
- Light, dark, and system themes using CSS variables
- Desktop popover and responsive mobile bottom sheet
- Min/max dates, unavailable dates, and min/max range lengths
- Presets, strict parsing, HTML form serialization, and SSR-safe imports
- Keyboard and screen-reader behavior powered by React Aria

## Install

```bash
pnpm add react-dual-calendar-range
```

The styled entry automatically includes its CSS. You may also import it explicitly when your framework requires CSS imports at an application entry point:

```tsx
import "react-dual-calendar-range/styles.css";
```

## Styled picker

```tsx
import { useState } from "react";
import {
  DateRangePicker,
  type DateRangeValue
} from "react-dual-calendar-range";

export function BookingRange() {
  const [value, setValue] = useState<DateRangeValue>(null);

  return (
    <DateRangePicker
      value={value}
      onChange={setValue}
      calendar="jalali"
      locale="fa-IR"
      timeZone="Asia/Tehran"
      minDate={new Date()}
      minDays={2}
      maxDays={30}
      startName="checkIn"
      endName="checkOut"
    />
  );
}
```

`onChange` runs only after the user presses Apply. Cancel restores the committed value. Start and end form fields are submitted as Gregorian ISO dates (`YYYY-MM-DD`) regardless of the displayed calendar.

## Gregorian and inline calendar

```tsx
import { RangeCalendar } from "react-dual-calendar-range";

<RangeCalendar
  calendar="gregorian"
  locale="en-US"
  timeZone="America/New_York"
  defaultValue={{
    start: new Date(2026, 9, 14),
    end: new Date(2026, 9, 20)
  }}
  onChange={(range) => console.log(range)}
/>;
```

The inline calendar commits when a complete range is selected. The styled picker uses a draft followed by Apply or Cancel.

## Headless API

Importing the headless entry does not import CSS.

```tsx
import {
  DateRangePickerPrimitive as Range
} from "react-dual-calendar-range/headless";

<Range.Root calendar="jalali" locale="fa-IR">
  <Range.Fields />
  <Range.Trigger>انتخاب تاریخ</Range.Trigger>
  <Range.Popover>
    <Range.Presets />
    <Range.Actions />
  </Range.Popover>
</Range.Root>;
```

For fully custom markup, use `useDateRangePicker`. It exposes committed and draft values, localized input text, parsing, validation, overlay state, presets, Apply/Cancel actions, and React Aria calendar adapters.

## Main props

| Prop | Type | Default |
| --- | --- | --- |
| `value` / `defaultValue` | `{ start: Date; end: Date } \| null` | `null` |
| `onChange` | `(value) => void` | — |
| `calendar` | `"jalali" \| "gregorian"` | `"jalali"` |
| `locale` | `"fa-IR" \| "en-US"` | Based on calendar |
| `direction` | `"rtl" \| "ltr" \| "auto"` | `"auto"` |
| `timeZone` | IANA time-zone string | Browser local zone |
| `dateFormat` | `yyyy/MM/dd`, `MM/dd/yyyy`, or `dd/MM/yyyy` | Based on locale |
| `minDate` / `maxDate` | `Date` | — |
| `minDays` / `maxDays` | `number` | — |
| `isDateDisabled` | `(date: Date) => boolean` | — |
| `presets` | `false \| DatePreset[]` | Today, last 7 days, current month |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` |
| `messages` | localized message overrides | built in |
| `startName` / `endName` | `string` | — |

## Styling

The styled entry loads the self-hosted variable Vazirmatn font (the maintained Vazir family) by default. Override CSS variables on the root or a parent theme selector:

```css
.my-picker {
  --dcr-accent: #0f8f83;
  --dcr-accent-hover: #08766d;
  --dcr-range: #dff5f1;
  --dcr-range-hover: #c9ece6;
  --dcr-range-text: #075f58;
  --dcr-radius-md: 10px;
  --dcr-cell-size: 40px;
  --dcr-font-family: Vazirmatn, sans-serif;
}
```

Use `className` for the root and `classNames` for individual slots. Headless primitives expose `data-*` state attributes for custom styling.

## SSR and Next.js

The package does not access `window` during import or server render. Date-only JavaScript values can be interpreted differently when server and browser time zones differ, so pass a stable `locale` and `timeZone` in SSR applications.

Interactive pickers in the Next.js App Router must be rendered from a Client Component:

```tsx
"use client";

<DateRangePicker
  calendar="jalali"
  locale="fa-IR"
  timeZone="Asia/Tehran"
/>;
```

## Accessibility

The calendar supports arrow-key navigation, disabled and unavailable dates, focus-visible states, localized labels, live validation errors, reduced motion, and screen readers. Keep a visible label or the supplied accessible field labels when composing a custom UI.

## Development

```bash
pnpm install
pnpm check
pnpm storybook
pnpm test:e2e
```

Run `pnpm changeset` for public changes. Releases are published through GitHub Actions with npm Trusted Publishing and provenance.

## License

MIT
