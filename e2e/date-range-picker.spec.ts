import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const stories = {
  jalali: "/iframe.html?id=date-range-picker--jalali&viewMode=story",
  gregorian: "/iframe.html?id=date-range-picker--gregorian&viewMode=story",
  dark: "/iframe.html?id=date-range-picker--dark&viewMode=story",
  inline: "/iframe.html?id=date-range-picker--inline-calendar&viewMode=story"
};

test("Jalali picker is keyboard accessible", async ({ page }) => {
  await page.goto(stories.jalali);
  await page.getByRole("button", { name: "باز کردن تقویم" }).click();
  await expect(page.getByRole("dialog", { name: "انتخاب بازه تاریخ" })).toBeVisible();
  await expect(page.locator(".dcr-calendar__month")).toHaveCount(1);

  const selectedStart = page.locator(".dcr-calendar__cell[data-selection-start]");
  await expect(selectedStart).toHaveText(/\d|[۰-۹]/);
  await expect(selectedStart).toHaveCSS("align-items", "center");
  await expect(selectedStart).toHaveCSS("justify-items", "center");
  await expect(selectedStart).toHaveCSS("border-top-left-radius", "0px");

  const nextBox = await page.getByRole("button", { name: "ماه بعد" }).boundingBox();
  const previousBox = await page.getByRole("button", { name: "ماه قبل" }).boundingBox();
  expect(nextBox?.x).toBeLessThan(previousBox?.x ?? Number.NEGATIVE_INFINITY);
  await expect(page.locator(".dcr-preset").first()).toHaveCSS("text-align", "right");

  if ((page.viewportSize()?.width ?? 0) > 699) {
    await expect(page.locator(".dcr-popover")).not.toHaveAttribute("data-entering", "true");
    const rootBox = await page.locator(".dcr-root").boundingBox();
    const popoverBox = await page.locator(".dcr-popover").boundingBox();
    expect(Math.abs((rootBox?.width ?? 0) - (popoverBox?.width ?? 1))).toBeLessThanOrEqual(1);

    await selectedStart.hover();
    await page.waitForTimeout(180);
    const selectedColors = await selectedStart.evaluate((element) => ({
      text: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor
    }));
    expect(selectedColors.text).not.toBe(selectedColors.background);

    const presetsBox = await page.locator(".dcr-presets").boundingBox();
    const calendarBox = await page.locator(".dcr-calendar").boundingBox();
    expect(presetsBox?.x).toBeGreaterThan(calendarBox?.x ?? Number.POSITIVE_INFINITY);
  }

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await expect(page).toHaveScreenshot("jalali-light.png", { fullPage: true });
});

test("Gregorian picker renders in LTR", async ({ page }) => {
  await page.goto(stories.gregorian);
  await page.getByRole("button", { name: "Open calendar" }).click();
  await expect(page.locator(".dcr-root")).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".dcr-calendar__month")).toHaveCount(1);

  if ((page.viewportSize()?.width ?? 0) > 699) {
    await expect(page.locator(".dcr-popover")).not.toHaveAttribute("data-entering", "true");
    const rootBox = await page.locator(".dcr-root").boundingBox();
    const popoverBox = await page.locator(".dcr-popover").boundingBox();
    expect(Math.abs((rootBox?.width ?? 0) - (popoverBox?.width ?? 1))).toBeLessThanOrEqual(1);
  }

  const clearBox = await page.getByRole("button", { name: "Clear" }).boundingBox();
  const applyBox = await page.getByRole("button", { name: "Apply" }).boundingBox();
  const cancelBox = await page.getByRole("button", { name: "Cancel" }).boundingBox();
  expect(clearBox?.x).toBeGreaterThan(applyBox?.x ?? Number.POSITIVE_INFINITY);
  expect(clearBox?.x).toBeGreaterThan(cancelBox?.x ?? Number.POSITIVE_INFINITY);
  await expect(page).toHaveScreenshot("gregorian-light.png", { fullPage: true });
});

test("dark theme and inline calendar remain visually stable", async ({ page }) => {
  await page.goto(stories.dark);
  await page.getByRole("button", { name: "باز کردن تقویم" }).click();
  await expect(page).toHaveScreenshot("jalali-dark.png", { fullPage: true });

  await page.goto(stories.inline);
  await expect(page.locator(".dcr-inline")).toBeVisible();
  await expect(page).toHaveScreenshot("inline.png", { fullPage: true });
});
