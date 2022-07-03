// import { Selector } from 'testcafe';

// fixture `Real download events`
//   .page `http://localhost:3000/#progress-download-real`;

// test('should complete with real download events', async t => {
//   const result = Selector('#events');

//   await t
//     .switchToIframe('iframe')
//     .expect(result.innerText).contains('readyState 1\n' +
//       'hooked xhr though left untouched!\n' +
//       'readyState 2\n' +
//       'readyState 3\n')
//     .expect(result.innerText).contains(
//       'readyState 3\n' +
//       '100\n' +
//       'readyState 3\n' +
//       'readyState 4\n');
// });


import { test, expect } from "@playwright/test";

test("should complete with real download events", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/progress-download-real.html");
  const dom = page.locator('id=events');
  expect(await dom.innerText()).toContain('readyState 1\n' +
    'hooked xhr though left untouched!\n' +
    'readyState 2\n' +
    'readyState 3\n')
  expect(await dom.innerText()).toContain(
    'readyState 3\n' +
    '100\n' +
    'readyState 3\n' +
    'readyState 4\n');
});