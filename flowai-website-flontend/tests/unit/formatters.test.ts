import { describe, expect, it } from "vitest";

import { formatMoney, formatStatus } from "@/lib/formatters";

describe("formatMoney", () => {
  it("formats integer minor units", () => {
    expect(formatMoney(89900, "USD")).toBe("$899.00");
  });
});

describe("formatStatus", () => {
  it("humanizes order status", () => {
    expect(formatStatus("payment_succeeded")).toBe("Payment Succeeded");
  });
});
