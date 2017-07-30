import { Selector } from 'testcafe';

fixture `Fake Response`
  .page `http://localhost:3000/#fake-response`;

test('XHR content should be modified', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#res').innerText).eql('this is the third text file example (example3.txt)');
});

test('fetch content should be modified', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#fetch_res').innerText).eql('this is the third text file example (example3.txt)');
});
