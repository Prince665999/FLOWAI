import { test, expect } from "@playwright/test";

test("orders route requires auth", async ({ page }) => {
  await page.goto("/account/orders");
  await expect(page).toHaveURL(/login/);
});
