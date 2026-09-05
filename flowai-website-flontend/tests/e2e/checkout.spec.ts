import { test, expect } from "@playwright/test";

test("catalog page renders", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
});
