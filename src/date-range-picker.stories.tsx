import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangePicker } from "./date-range-picker";
import { RangeCalendar } from "./calendar";
import {
  DateRangeActions,
  DateRangeCalendar,
  DateRangeFields,
  DateRangePopover,
  DateRangePresets,
  DateRangeRoot,
  DateRangeTrigger
} from "./primitives";
import type { DateRangeValue } from "./types";

const meta = {
  title: "Date Range Picker",
  component: DateRangePicker,
  parameters: { layout: "centered" },
  args: {
    timeZone: "Asia/Tehran"
  }
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Jalali: Story = {
  args: {
    calendar: "jalali",
    locale: "fa-IR",
    theme: "light",
    defaultValue: {
      start: new Date(2026, 9, 14),
      end: new Date(2026, 9, 20)
    }
  }
};

export const Gregorian: Story = {
  args: {
    calendar: "gregorian",
    locale: "en-US",
    theme: "light",
    defaultValue: {
      start: new Date(2026, 9, 14),
      end: new Date(2026, 9, 20)
    }
  }
};

export const Dark: Story = {
  args: {
    calendar: "jalali",
    locale: "fa-IR",
    theme: "dark",
    defaultValue: {
      start: new Date(2026, 9, 14),
      end: new Date(2026, 9, 20)
    }
  },
  parameters: { backgrounds: { default: "dark" } }
};

export const WithConstraints: Story = {
  args: {
    calendar: "gregorian",
    locale: "en-US",
    minDate: new Date(2026, 9, 1),
    maxDate: new Date(2026, 11, 31),
    minDays: 3,
    maxDays: 14,
    isDateDisabled: (date) => date.getDay() === 0
  }
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeValue>(null);
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <DateRangePicker {...args} value={value} onChange={setValue} />
        <output style={{ font: "12px ui-monospace", opacity: 0.75 }}>
          {value ? `${value.start.toISOString()} → ${value.end.toISOString()}` : "No range selected"}
        </output>
      </div>
    );
  },
  args: { calendar: "jalali", locale: "fa-IR" }
};

export const InlineCalendar: Story = {
  render: () => (
    <RangeCalendar
      calendar="jalali"
      locale="fa-IR"
      timeZone="Asia/Tehran"
      defaultValue={{ start: new Date(2026, 9, 14), end: new Date(2026, 9, 20) }}
    />
  )
};

export const HeadlessComposition: Story = {
  render: () => (
    <DateRangeRoot calendar="jalali" locale="fa-IR" timeZone="Asia/Tehran">
      <DateRangeFields />
      <DateRangeTrigger />
      <DateRangePopover>
        <DateRangePresets />
        <DateRangeCalendar />
        <DateRangeActions />
      </DateRangePopover>
    </DateRangeRoot>
  )
};
