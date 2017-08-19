import { Selector } from 'testcafe';

fixture `Case Insensitive Headers`
  .page `http://localhost:3000/#case-insensitive-headers`;

test('response should include all header variations', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#result-1').innerText).contains('conTENT-type: text/plain; charset=UTF-8')
    .expect(Selector('#result-1').innerText).contains('CONTENt-TYPe: text/plain; charset=UTF-8')
    .expect(Selector('#result-1').innerText).contains('Content-Type: text/plain; charset=UTF-8');
});

test('response should include all values for foo-bar header', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#result-2').innerText).contains('"foO-BAR": "42, 21"');
});


