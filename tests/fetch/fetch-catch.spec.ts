import { test, expect } from "@playwright/test";

test("Should be reject if native fetch is reject", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/common.html");
  const callInCatch = await page.evaluate(async () => {
    let callInCatch = false;
    await fetch("http://127.0.0.1:8081/unexsited").catch(() => {
      callInCatch = true;
    });
    return callInCatch;
  });
  expect(callInCatch).toEqual(true);
});

test("Should call the afterHook when a request fails", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/common.html");
  const { callInAfter, isCallFailed } = await page.evaluate(async () => {
    let callInAfter = false;
    let isCallFailed = false;
    //@ts-ignore
    xhook.after((req, res) => {
      callInAfter = true;
    });
    try {
      await fetch("http://127.0.0.1:8081/unexsited");
    } catch {
      isCallFailed = true;
    }
    return { callInAfter, isCallFailed };
  });
  expect(isCallFailed).toBe(true);
  expect(callInAfter).toBe(true);
});
