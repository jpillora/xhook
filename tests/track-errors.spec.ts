import { test, expect } from "@playwright/test";

test("Should detect XHR & fetch errors", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/track-errors.html");
  const text = await page.locator("pre").innerText();
  expect(text).toContain("(1) Non-200 error code detected: 404");
  expect(text).toContain("(2) Non-200 error code detected: 404");
});
