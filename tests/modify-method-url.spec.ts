import { test, expect } from "@playwright/test";

test.describe('Modify Method Url', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/modify-method-url.html");
  })
  test("example 1 response should not be modified", async ({ page }) => {
    const text = await page.locator('id=one').innerText();
    expect(text).toEqual('this is the second text file example (example2.txt)')
  });
  test("example 2 response should be modified", async ({ page }) => {
    const text = await page.locator('id=fetch_one').innerText();
    expect(text).toEqual('this is the second text file example (example2.txt)')
  });
})