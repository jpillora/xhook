// import { Selector } from 'testcafe';

// fixture`Real upload events`
//   .page`http://localhost:3000/#progress-upload-real`;

// test('should complete with real upload events', async t => {
//   const result = Selector('#events');

//   await t
//     .switchToIframe('iframe')
//     .expect(result.innerText).eql('readyState 1\n' +
//       'sending #288889 chars\n' +
//       'hooked xhr though left untouched!\n' +
//       'upload started\n' +
//       '100\n' +
//       'upload complete\n' +
//       'readyState 2\n' +
//       'readyState 3\n' +
//       'readyState 4\n');
// });



import { test, expect } from "@playwright/test";

test("should complete with real upload events", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/progress-upload-real.html");
  const dom = page.locator('id=events');
  expect(await dom.innerText()).toContain('readyState 1\n' +
    'sending #288889 chars\n' +
    'hooked xhr though left untouched!\n' +
    'upload started\n' +
    '100\n' +
    'upload complete\n' +
    'readyState 2\n' +
    'readyState 3\n' +
    'readyState 4\n')
});