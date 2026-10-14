import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "../src/date-range-picker";

const baseProps = {
  calendar: "gregorian" as const,
  locale: "en-US" as const,
  timeZone: "UTC",
  theme: "light" as const
};

describe("DateRangePicker", () => {
  it("accepts manually typed dates and commits only after Apply", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker {...baseProps} onChange={onChange} />);

    const start = screen.getByLabelText("Start date");
    const end = screen.getByLabelText("End date");
    await user.type(start, "10/14/2026");
    await user.tab();
    await user.type(end, "10/20/2026");
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText("Open calendar"));
    await user.click(await screen.findByRole("button", { name: "Apply" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0]?.[0];
    expect(range.start.toISOString().slice(0, 10)).toBe("2026-10-14");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-10-20");
  });

  it("cancels draft changes without updating the committed value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        {...baseProps}
        defaultValue={{ start: new Date("2026-10-14T00:00:00Z"), end: new Date("2026-10-20T00:00:00Z") }}
        onChange={onChange}
      />
    );

    await user.click(screen.getByLabelText("Open calendar"));
    await user.click(await screen.findByRole("button", { name: "Clear" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Start date")).toHaveValue("10/14/2026");
  });

  it("serializes committed form values as Gregorian ISO dates", () => {
    const { container } = render(
      <DateRangePicker
        {...baseProps}
        value={{ start: new Date("2026-10-14T00:00:00Z"), end: new Date("2026-10-20T00:00:00Z") }}
        startName="from"
        endName="to"
      />
    );
    expect(container.querySelector('input[name="from"]')).toHaveValue("2026-10-14");
    expect(container.querySelector('input[name="to"]')).toHaveValue("2026-10-20");
  });

  it("renders safely on the server with explicit locale and timezone", () => {
    expect(() => renderToString(<DateRangePicker {...baseProps} />)).not.toThrow();
  });

  it("has no detectable axe violations in the closed state", async () => {
    const { container } = render(<DateRangePicker {...baseProps} />);
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(result.violations).toEqual([]);
  });

  it("shows validation feedback for an unavailable day inside the range", async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        {...baseProps}
        isDateDisabled={(date) => date.getUTCDate() === 16}
      />
    );
    await user.type(screen.getByLabelText("Start date"), "10/14/2026");
    await user.tab();
    await user.type(screen.getByLabelText("End date"), "10/20/2026");
    await user.tab();

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("unavailable"));
  });
});
