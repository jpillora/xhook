import { test, expect } from "@playwright/test";

test("Should be reject if native fetch is reject", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/common.html");
    const obj = {
        isError: false,
        isFinished: false
    }
    await page.evaluate((obj) => {
        fetch('http://127.0.0.1:8080/unexsited').catch(() => {
            obj.isError = true
        }).finally(() => {
            obj.isFinished = true
        })
    }, obj)
    let setI = setInterval(() => {
        if (obj.isFinished) {
            expect(obj.isError).toEqual(true)
            clearInterval(setI)
        }
    }, 100)
});



test("Should call the afterHook when a request fails", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/common.html");
    const callInAfter = await page.evaluate(async () => {
        let callInAfter = false
        //@ts-ignore
        xhook.after((req, res) => {
            callInAfter = true
        })
        try {
            await fetch('http://127.0.0.1:8081/unexsited')
        } catch { }
        return callInAfter
    })
    expect(callInAfter).toBe(true)
});
