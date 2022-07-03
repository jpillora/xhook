// import { Selector } from 'testcafe';

// fixture`Fetch WebWorker`
//   .page`http://localhost:3000/#fetch-webworker`;

// test('example 1 response should not be modified', async t => {
//   await t
//     .switchToIframe('iframe')
//     .expect(Selector('#one').innerText).eql('this is the first text file example (example1.txt)');
// });

// test('example 2 response should be modified', async t => {
//   await t
//     .switchToIframe('iframe')
//     .expect(Selector('#two').innerText).eql('thzs zs thz szcznd tzxt fzlz zxzmplz (zxzmplz2.txt)');
// });



import { test, expect } from "@playwright/test";

test.describe('Fetch WebWorker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/fetch-webworker.html");
  })
  test("example 1 response should not be modified", async ({ page }) => {
    await page.waitForResponse('**/example1.txt')
    const text = await page.locator('id=one').innerText();
    expect(text).toEqual('this is the first text file example (example1.txt)')
  });
  test("example 2 response should be modified", async ({ page }) => {
    await page.waitForResponse('**/example2.txt')
    const text = await page.locator('id=two').innerText();
    expect(text).toEqual('thzs zs thz szcznd tzxt fzlz zxzmplz (zxzmplz2.txt)')
  });
})
