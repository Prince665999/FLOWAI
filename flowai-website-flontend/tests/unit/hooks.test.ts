import { describe, expect, it } from "vitest";

import { PAGE_SIZE } from "@/lib/constants";

describe("hooks constants", () => {
  it("keeps a stable catalog page size", () => {
    expect(PAGE_SIZE).toBe(12);
  });
});
