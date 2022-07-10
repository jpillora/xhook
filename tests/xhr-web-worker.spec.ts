import { test, expect } from "@playwright/test";

test.describe('XHR WebWorker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/xhr-webworker.html");
  })
  test("example 1 should return example1.txt", async ({ page }) => {
    await page.waitForResponse('**/example1.txt')
    const text = await page.locator("id=one").innerText();
    expect(text).toContain("this is the first text file example (example1.txt)");
  });
  test("example 2 should return example2.txt", async ({ page }) => {
    await page.waitForResponse('**/example2.txt')
    const text = await page.locator("id=two").innerText();
    expect(text).toContain("thzs zs thz szcznd tzxt fzlz zxzmplz (zxzmplz2.txt)");
  });
})