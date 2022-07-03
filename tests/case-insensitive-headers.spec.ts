// import { Selector } from 'testcafe';

// fixture `Case Insensitive Headers`
//   .page `http://localhost:3000/#case-insensitive-headers`;

// test('response should include all header variations', async t => {
//   await t
//     .switchToIframe('iframe')
//     .expect(Selector('#result-1').innerText).contains('conTENT-type: text/plain; charset=UTF-8')
//     .expect(Selector('#result-1').innerText).contains('CONTENt-TYPe: text/plain; charset=UTF-8')
//     .expect(Selector('#result-1').innerText).contains('Content-Type: text/plain; charset=UTF-8');
// });

// test('response should include all values for foo-bar header', async t => {
//   await t
//     .switchToIframe('iframe')
//     .expect(Selector('#result-2').innerText).contains('"foO-BAR": "42, 21"');
// });


import { test, expect } from "@playwright/test";

test.describe("Case Insensitive Headers", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://127.0.0.1:8080/example/case-insensitive-headers.html");
	})
	test("response should include all header variations", async ({ page }) => {
		const result1 = await page.locator('id=result-1').innerText()
		expect(result1).toContain("conTENT-type: text/plain; charset=UTF-8")
		expect(result1).toContain("CONTENt-TYPe: text/plain; charset=UTF-8")
		expect(result1).toContain("Content-Type: text/plain; charset=UTF-8")
	});
	test("response should include all values for foo-bar header", async ({ page }) => {
		const result2 = await page.locator('id=result-2').innerText()
		expect(result2).toContain('"foO-BAR": "42, 21"')
	})
})



