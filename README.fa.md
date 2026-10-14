# راهنمای فارسی react-dual-calendar-range

`react-dual-calendar-range` یک پکیج انتخاب بازه تاریخ برای React است که تقویم شمسی و میلادی را با یک API یکپارچه در اختیار توسعه‌دهنده قرار می‌دهد.

این پکیج برای پروژه‌هایی طراحی شده است که علاوه بر منطق صحیح تاریخ، به ظاهر حرفه‌ای، دسترس‌پذیری، پشتیبانی از زبان فارسی و امکان شخصی‌سازی کامل نیاز دارند. توسعه‌دهنده می‌تواند از کامپوننت آماده استفاده کند یا با API بدون استایل (Headless) رابط کاربری اختصاصی خودش را بسازد.

## این پکیج چه مسئله‌ای را حل می‌کند؟

ساخت یک Date Range Picker واقعی فقط نمایش چند روز در جدول نیست. مواردی مانند تبدیل شمسی و میلادی، سال کبیسه، جهت RTL، مدیریت timezone، ورود دستی تاریخ، اعتبارسنجی بازه، دسترسی‌پذیری صفحه‌کلید و هماهنگی با SSR باید هم‌زمان درست کار کنند.

این پکیج این بخش‌ها را در یک راهکار واحد ارائه می‌دهد:

- انتخاب تاریخ شروع و پایان به‌صورت یک بازه
- نمایش شمسی یا میلادی بدون تغییر مدل داده برنامه
- رابط فارسی RTL و انگلیسی LTR
- نسخه آماده با طراحی مدرن
- هسته Headless برای طراحی کاملاً اختصاصی
- رفتار صحیح در React، فرم‌های HTML، Next.js و SSR

## خروجی تاریخ چگونه است؟

مدل عمومی پکیج از `Date` استاندارد جاوااسکریپت استفاده می‌کند:

```ts
type DateRangeValue = {
  start: Date;
  end: Date;
} | null;
```

تقویم فقط نحوه نمایش و انتخاب تاریخ را تغییر می‌دهد. بنابراین حتی اگر کاربر تاریخ را به‌صورت شمسی انتخاب کند، برنامه همچنان یک `Date` استاندارد دریافت می‌کند و لازم نیست در لایه‌های دیگر نرم‌افزار با یک نوع داده اختصاصی کار کنید.

تاریخ شروع و پایان هر دو جزو بازه هستند. برای مثال بازه ۱ تا ۳ یک بازه سه‌روزه محسوب می‌شود.

## امکانات اصلی

### تقویم شمسی و میلادی

- تقویم شمسی با مقدار `calendar="jalali"`
- تقویم میلادی با مقدار `calendar="gregorian"`
- محاسبات تقویمی بر پایه `@internationalized/date`
- پشتیبانی از سال‌های کبیسه و تبدیل دقیق تاریخ‌ها
- امکان تعیین مستقل نوع تقویم و زبان رابط کاربری

### رابط فارسی و انگلیسی

- فارسی با `locale="fa-IR"` و جهت RTL
- انگلیسی با `locale="en-US"` و جهت LTR
- پذیرش اعداد فارسی، عربی و لاتین در ورودی‌ها
- پیام‌ها، عنوان‌ها و خطاهای محلی‌سازی‌شده
- امکان جایگزین‌کردن تمام متن‌ها با prop به نام `messages`
- فونت Vazirmatn در نسخه استایل‌دار

### انتخاب بازه با رفتار قابل پیش‌بینی

در کامپوننت آماده، انتخاب کاربر ابتدا به‌صورت draft نگهداری می‌شود:

- دکمه «اعمال» مقدار جدید را ثبت می‌کند و `onChange` را فراخوانی می‌کند.
- دکمه «انصراف» تغییرات موقت را کنار می‌گذارد.
- دکمه «پاک کردن» بازه موقت را خالی می‌کند.
- بازه ناقص یا نامعتبر قابل اعمال نیست.

این رفتار برای فرم‌های رزرو، گزارش‌گیری، فیلتر داده و انتخاب بازه مالی مناسب است؛ چون کلیک موقت کاربر بلافاصله state اصلی برنامه را تغییر نمی‌دهد.

### محدودیت‌ها و اعتبارسنجی

توسعه‌دهنده می‌تواند قوانین انتخاب تاریخ را مستقیماً با propها تعریف کند:

- `minDate`: اولین تاریخ مجاز
- `maxDate`: آخرین تاریخ مجاز
- `minDays`: حداقل تعداد روزهای بازه
- `maxDays`: حداکثر تعداد روزهای بازه
- `isDateDisabled`: غیرفعال‌کردن تاریخ‌ها با منطق اختصاصی
- `required`: اجباری‌کردن انتخاب بازه
- `disabled`: غیرفعال‌کردن کامل کنترل
- `readOnly`: نمایش مقدار بدون اجازه تغییر

اگر بازه از یک تاریخ غیرفعال عبور کند یا قوانین طول بازه را نقض کند، مقدار ثبت نمی‌شود و پیام خطای قابل‌دسترسی نمایش داده خواهد شد.

### ورود دستی تاریخ

کاربر علاوه بر تقویم می‌تواند تاریخ شروع و پایان را مستقیماً تایپ کند.

- پشتیبانی از اعداد `۰۱۲۳۴۵۶۷۸۹`، `٠١٢٣٤٥٦٧٨٩` و `0123456789`
- اعتبارسنجی strict هنگام خروج از فیلد یا فشردن Enter
- جلوگیری از ثبت تاریخ ناقص یا نامعتبر
- پشتیبانی از فرمت‌های `yyyy/MM/dd`، `MM/dd/yyyy` و `dd/MM/yyyy`
- نمایش وضعیت نامعتبر با `aria-invalid`

### Presetهای آماده و اختصاصی

سه انتخاب سریع به‌صورت پیش‌فرض وجود دارد:

- امروز
- ۷ روز اخیر
- ماه جاری

Presetها بر اساس تقویم فعال محاسبه می‌شوند. همچنین می‌توان آرایه‌ای از `DatePreset`های اختصاصی تعریف کرد یا با `presets={false}` این بخش را حذف کرد.

### حالت Controlled و Uncontrolled

پکیج با هر دو الگوی رایج React سازگار است:

- `value` و `onChange` برای حالت Controlled
- `defaultValue` برای حالت Uncontrolled

این قابلیت استفاده همراه React Hook Form، Formik، state managerها یا state محلی React را ساده می‌کند.

## کامپوننت‌های آماده

### DateRangePicker

کامپوننت اصلی شامل این بخش‌هاست:

- دو ورودی تاریخ شروع و پایان
- دکمه بازکردن تقویم
- popup دسکتاپ
- Bottom Sheet واکنش‌گرا در موبایل
- تقویم یک‌ماهه
- انتخاب سریع بازه
- دکمه‌های اعمال، انصراف و پاک‌کردن
- تم روشن، تیره و system

نمونه استفاده:

```tsx
import { useState } from "react";
import {
  DateRangePicker,
  type DateRangeValue
} from "react-dual-calendar-range";

export function BookingDates() {
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
      theme="system"
    />
  );
}
```

### RangeCalendar

اگر فقط تقویم inline لازم باشد و نیازی به ورودی یا popup نباشد، می‌توان از `RangeCalendar` استفاده کرد:

```tsx
import { RangeCalendar } from "react-dual-calendar-range";

<RangeCalendar
  calendar="gregorian"
  locale="en-US"
  timeZone="UTC"
  onChange={(range) => console.log(range)}
/>;
```

## API بدون استایل (Headless)

ورودی `react-dual-calendar-range/headless` هیچ CSS اجباری وارد نمی‌کند. این بخش برای design systemها یا محصولاتی مناسب است که ظاهر کاملاً اختصاصی دارند.

دو روش برای استفاده وجود دارد:

### Hook سطح پایین

Hook به نام `useDateRangePicker` منطق کامل کنترل را ارائه می‌دهد، از جمله:

- مقدار ثبت‌شده و draft
- باز و بسته‌کردن overlay
- parsing و formatting ورودی‌ها
- اعتبارسنجی تاریخ و بازه
- انتخاب preset
- عملیات Apply، Cancel و Clear
- تبدیل مقدار برای React Aria Calendar

### Primitiveهای ترکیبی

Primitiveهای زیر برای ساخت رابط دلخواه ارائه شده‌اند:

- `DateRangeRoot`
- `DateRangeFields`
- `DateRangeInput`
- `DateRangeTrigger`
- `DateRangePopover`
- `DateRangeCalendar`
- `DateRangeHeader`
- `DateRangeGrid`
- `DateRangeCell`
- `DateRangePresets`
- `DateRangeActions`

این primitiveها state را از طریق context و `data-*` attributeها در دسترس CSS قرار می‌دهند.

## شخصی‌سازی ظاهر

نسخه آماده بر پایه CSS Variables ساخته شده است. در نتیجه بدون fork کردن پکیج می‌توان رنگ، فونت، اندازه سلول، radius و فاصله‌ها را تغییر داد:

```css
.booking-picker {
  --dcr-accent: #0f766e;
  --dcr-accent-hover: #115e59;
  --dcr-range: #ccfbf1;
  --dcr-range-hover: #99f6e4;
  --dcr-range-text: #134e4a;
  --dcr-radius-md: 12px;
  --dcr-cell-size: 42px;
  --dcr-font-family: Vazirmatn, sans-serif;
}
```

برای تغییر یک بخش مشخص نیز می‌توان از `className` و `classNames` استفاده کرد. slotهای پایدار برای root، فیلدها، popup، sidebar، header، grid، cell و actionها در دسترس هستند.

## تم‌ها

سه حالت تم ارائه می‌شود:

```tsx
<DateRangePicker theme="light" />
<DateRangePicker theme="dark" />
<DateRangePicker theme="system" />
```

حالت `system` از تنظیمات روشن یا تیره سیستم‌عامل کاربر پیروی می‌کند. انیمیشن‌ها نیز با `prefers-reduced-motion` سازگار هستند.

## فرم‌های HTML

با تعیین `startName` و `endName`، دو input مخفی برای ارسال فرم ساخته می‌شود:

```tsx
<DateRangePicker
  startName="checkIn"
  endName="checkOut"
/>
```

مقدار ارسال‌شده همیشه به فرمت میلادی ISO یعنی `YYYY-MM-DD` است؛ حتی وقتی رابط کاربری تقویم شمسی را نمایش می‌دهد. این موضوع ذخیره‌سازی در API و دیتابیس را ساده‌تر می‌کند.

## SSR و Next.js

import و render سمت سرور بدون دسترسی مستقیم به `window` انجام می‌شود. برای جلوگیری از اختلاف تاریخ بین سرور و مرورگر بهتر است `locale` و `timeZone` صریح تعیین شوند:

```tsx
"use client";

<DateRangePicker
  calendar="jalali"
  locale="fa-IR"
  timeZone="Asia/Tehran"
/>;
```

پکیج خروجی‌های ESM، CommonJS و TypeScript declaration دارد و برای React 18 و React 19 طراحی شده است.

## دسترس‌پذیری

تعاملات تقویم بر پایه React Aria ساخته شده‌اند و امکانات زیر را فراهم می‌کنند:

- پیمایش کامل با صفحه‌کلید
- مدیریت focus هنگام باز و بسته‌شدن popup
- labelهای مناسب برای screen reader
- مشخص‌کردن تاریخ انتخاب‌شده، امروز و تاریخ غیرفعال
- پیام خطای قابل‌خواندن برای فناوری‌های کمکی
- focus-visible واضح
- رعایت reduced motion

هدف طراحی، سازگاری با WCAG 2.2 AA است و سناریوها با axe و Playwright بررسی می‌شوند.

## چه پروژه‌هایی از این پکیج سود می‌برند؟

- سامانه‌های رزرو هتل، بلیت و اقامتگاه
- پنل‌های گزارش‌گیری و فیلتر داده
- داشبوردهای مالی و حسابداری
- فروشگاه‌ها و سامانه‌های ارسال
- محصولات ایرانی که هم‌زمان مخاطب فارسی و بین‌المللی دارند
- design systemهایی که به منطق آماده و ظاهر اختصاصی نیاز دارند

## نصب

پس از انتشار پکیج در npm:

```bash
npm install react-dual-calendar-range
```

یا:

```bash
pnpm add react-dual-calendar-range
```

در صورت نیاز می‌توان CSS را صریح وارد کرد:

```tsx
import "react-dual-calendar-range/styles.css";
```

## مجوز

این پروژه با مجوز MIT منتشر می‌شود و در پروژه‌های شخصی و تجاری قابل استفاده است.
