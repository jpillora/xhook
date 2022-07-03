// import { Selector } from 'testcafe';

// fixture `Modify Headers`
//   .page `http://localhost:3000/#modify-headers`;

// test('response should include Foo Header', async t => {
//   await t
//     .switchToIframe('iframe')
//     .expect(Selector('#res').innerText).contains('foo:\tBar');
// });


import { test, expect } from "@playwright/test";

test("response should include Foo Header", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/modify-headers.html");
  const text = await page.locator('id=res').innerText();
  expect(text).toContain('foo:\tBar')
});