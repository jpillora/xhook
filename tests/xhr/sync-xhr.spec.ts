import { test, expect } from "@playwright/test";

test("sync XHR should not fail", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/common.html");
    const text = await page.evaluate(async () => {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/example/example1.txt', false);
            xhr.onload = function () {
                resolve(xhr.responseText)
            };
            xhr.send();
        })
    })
    expect(text).toEqual('this is the first text file example (example1.txt)')
});