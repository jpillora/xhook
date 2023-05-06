import { test, expect } from "@playwright/test";

test("response should include Foo Header", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/modify-headers.html");

  const text = await page.locator('id=res').innerText();
  expect(text).toContain('foo: Bar')
});
