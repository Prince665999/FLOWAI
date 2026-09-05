import { describe, expect, it } from "vitest";

import { addressSchema } from "@/lib/validators/address";
import { ticketSchema } from "@/lib/validators/ticket";

describe("validators", () => {
  it("accepts a valid address", () => {
    const parsed = addressSchema.safeParse({
      full_name: "Ada Lovelace",
      line1: "1 Analytical Engine Rd",
      city: "London",
      country: "GB",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a short ticket", () => {
    const parsed = ticketSchema.safeParse({ subject: "Hi", description: "Too short" });
    expect(parsed.success).toBe(false);
  });
});
