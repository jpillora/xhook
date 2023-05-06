import { test, expect } from "@playwright/test";

test.describe("Fake Response", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/fake-response.html");
  });
  test("XHR content should be modified", async ({ page }) => {
    await page.waitForTimeout(1000);
    const text = await page.locator("id=res").innerText();
    expect(text).toEqual("this is the third text file example (example3.txt)");
  });

  test("fetch content should be modified", async ({ page }) => {
    await page.waitForTimeout(1000);
    const text = await page.locator("id=fetch_res").innerText();
    expect(text).toEqual("this is the third text file example (example3.txt)");
  });
});
