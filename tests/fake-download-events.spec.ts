import { test, expect } from "@playwright/test";

test("should complete with fake download events", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/progress-download-fake.html");
  await page.waitForTimeout(1000);
  const text = await page.locator("id=events").innerText();
  expect(text).toEqual(
    "readyState 1\n" +
      "0\n" +
      "readyState 2\n" +
      "readyState 3\n" +
      "13\n" +
      "readyState 3\n" +
      "26\n" +
      "readyState 3\n" +
      "39\n" +
      "readyState 3\n" +
      "52\n" +
      "readyState 3\n" +
      "65\n" +
      "readyState 3\n" +
      "78\n" +
      "readyState 3\n" +
      "91\n" +
      "readyState 3\n" +
      "100\n" +
      "readyState 3\n" +
      "readyState 4\n",
  );
});
