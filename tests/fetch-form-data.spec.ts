// import { Selector } from 'testcafe';

// fixture`Fetch With FormData`
//   .page`http://localhost:3000/#fetch-form-data`;

// test('should send username & password using FormData', async t => {
//   // const result = Selector('#result');

//   await t
//     .switchToIframe('iframe')
//     .typeText('#username', 'username')
//     .typeText('#password', 'password')
//     .click('#submit')
//     .expect(Selector('#result').innerText).contains('"form": {\n' +
//       '    "password": "password",\n' +
//       '    "username": "username"\n' +
//       '  }');
// });


import { test, expect } from "@playwright/test";


test("should send username & password using FormData", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/fetch-form-data.html");
  await page.fill('id=username', 'username')
  await page.fill('id=password', 'password')
  await page.locator('id=submit').click()
  await page.waitForResponse('**/cors-test')
  const text = await page.locator('id=result').innerText();
  expect(text).toContain('"form": {\n' +
    '    "password": "password",\n' +
    '    "username": "username"\n' +
    '  }')
});
