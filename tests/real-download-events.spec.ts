import { test, expect } from "@playwright/test";

test("should complete with real download events", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit" ||
      (browserName === "chromium" && process.env.RUNNER_OS === "Windows"),
    "Still working on it",
  );
  await page.goto("http://127.0.0.1:8080/example/progress-download-real.html");
  const dom = page.locator("id=events");
  expect(await dom.innerText()).toContain(
    "readyState 1\n" +
      "hooked xhr though left untouched!\n" +
      "readyState 2\n" +
      "readyState 3\n",
  );
  expect(await dom.innerText()).toContain(
    "readyState 3\n" + "100\n" + "readyState 3\n" + "readyState 4\n",
  );
});
