// import { Selector } from 'testcafe';

// fixture `Add Event Listeners`
//   .page `http://localhost:3000/#add-event-listener`;

// test('Should add event listeners to XHR', async t => {
//   await t
//     .switchToIframe('iframe')
//     .expect(Selector('#one').innerText).eql('thzs zs thz szcznd tzxt fzlz zxzmplz (zxzmplz2.txt)')
//     .expect(Selector('#status').innerText).eql('loaded!!!');
// });

import { test, expect } from "@playwright/test";

test("Should add event listeners to XHR", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/example/add-event-listener.html");
    expect(await page.locator('id=one').innerText()).toEqual("thzs zs thz szcznd tzxt fzlz zxzmplz (zxzmplz2.txt)")
    expect(await page.locator('id=status').innerText()).toEqual("loaded!!!")
});

