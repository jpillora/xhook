import { Selector } from 'testcafe';

fixture `Track Errors`
  .page `http://localhost:3000/#track-errors`;

test('Should detect XHR & fetch errors', async t => {
  const result = Selector('pre');

  await t
    .switchToIframe('iframe')
    .expect(result.innerText).contains('(1) Non-200 error code detected: 404')
    .expect(result.innerText).contains('(2) Non-200 error code detected: 404');
});
