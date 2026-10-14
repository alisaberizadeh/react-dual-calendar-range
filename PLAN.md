# React Dual Calendar Range — Implementation Plan

This package implements an accessible, headless-first Jalali and Gregorian date range picker for React 18 and 19. It ships a styled component, an inline calendar, headless primitives, TypeScript types, light/dark themes, Persian/English localization, automated tests, Storybook documentation, and npm release workflows.

The public API uses JavaScript `Date` values at local midnight by default and supports an explicit IANA time zone for deterministic SSR. The internal date model is powered by `@internationalized/date`, while React Aria supplies accessible calendar and overlay behavior.

The initial public release is `0.1.0` under the MIT license. The working npm name is `react-dual-calendar-range` and must be checked again immediately before publishing.
