import { test, expect } from "@playwright/test";
import { createWaitting, addListenForUrl } from "./test.util";

test.describe("XHR Reuse", () => {
  test("example 1 should return example1.txt", async ({ page }) => {
    const { waitting, $resolve } = createWaitting();
    addListenForUrl(page, /example1.txt$/, $resolve);
    await page.goto("http://127.0.0.1:8080/example/xhr-reuse.html");
    await waitting;
    const text = await page.locator("id=one").innerText();
    expect(text).toContain(
      "this is the first text file example (example1.txt)"
    );
  });
  test("example 2 should return example2.txt", async ({ page }) => {
    const { waitting, $resolve } = createWaitting();
    addListenForUrl(page, /example2.txt$/, $resolve);
    await page.goto("http://127.0.0.1:8080/example/xhr-reuse.html");
    await waitting;
    const text = await page.locator("id=two").innerText();
    expect(text).toContain(
      "this is the second text file example (example2.txt)"
    );
  });
});
