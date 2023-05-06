import { test, expect } from "@playwright/test";

test("should send username & password using FormData", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/fetch-form-data.html");
  await page.fill("id=username", "username");
  await page.fill("id=password", "password");
  await page.locator("id=submit").click();
  await page.waitForResponse("**/cors-test");
  const text = await page.locator("id=result").innerText();
  expect(text).toContain(
    '"form": {\n' +
      '    "password": "password",\n' +
      '    "username": "username"\n' +
      "  }"
  );
});
