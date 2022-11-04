import { test, expect } from "@playwright/test";
import { createWaitting } from "../test.util";

test("Should preserve headers of Request", async ({ page }) => {
  const url = "http://127.0.0.1:8080/example/common.html";
  await page.goto(url);
  const { waitting, $resolve } = createWaitting();
  page.on("requestfinished", req => {
    $resolve(req.headers());
  });
  await page.evaluate(url => {
    const req = new Request(url, {
      headers: {
        "custom-xhook-header": "1",
      },
    });
    fetch(req);
  }, url);
  const headers = await waitting;
  expect(headers).toMatchObject({ "custom-xhook-header": "1" });
});
