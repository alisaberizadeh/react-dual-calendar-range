"use client";

import { useState } from "react";
import { DateRangePicker, type DateRangeValue } from "react-dual-calendar-range";
import "react-dual-calendar-range/styles.css";

export default function Page() {
  const [value, setValue] = useState<DateRangeValue>(null);
  return (
    <main>
      <DateRangePicker
        value={value}
        onChange={setValue}
        calendar="jalali"
        locale="fa-IR"
        timeZone="Asia/Tehran"
        startName="from"
        endName="to"
      />
    </main>
  );
}
