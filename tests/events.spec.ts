import { test, expect } from "@playwright/test";
import { createWaitting, addListenForUrl } from "./test.util";

test("should complete with xhook events", async ({ page }) => {
  const { waitting, $resolve } = createWaitting();
  addListenForUrl(page, /xhook$/, $resolve);
  await page.goto("http://127.0.0.1:8080/example/events.html");
  const dom = page.locator("id=xhook");
  await waitting;
  expect(await dom.innerText()).toContain(
    "[before start]...\n" +
      "[before end]\n" +
      "readystatechange (2)\n" +
      "readystatechange (3)\n" +
      "progress (3)\n" +
      "readystatechange (3)\n" +
      "readystatechange (4)\n" +
      "load (4)\n" +
      " => 200\n"
  );
  expect(await dom.innerText()).toContain("loadend (4)");
});
