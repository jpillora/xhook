import { test, expect } from "@playwright/test";
import { createWaitting } from "../test.util";

test("Should changed url of Request", async ({ page }) => {
  const url = "http://127.0.0.1:8080/example/common.html";
  await page.goto(url);
  const { waitting, $resolve } = createWaitting();
  page.on("requestfinished", req => {
    $resolve(req.url());
  });
  await page.evaluate(url => {
    // @ts-ignore
    xhook.before(function (req) {
      req.url = "example1.txt";
    });
    const req = new Request(url);
    fetch(req);
  }, "example2.txt");
  const fetchedUrl = await waitting;
  expect(fetchedUrl).toContain("example1.txt");
});
