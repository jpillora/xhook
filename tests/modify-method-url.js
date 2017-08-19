import { Selector } from 'testcafe';

fixture `Modify Method Url`
  .page `http://localhost:3000/#modify-method-url`;

test('XHR should get example2.txt content', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#one').innerText).eql('this is the second text file example (example2.txt)');
});

test('Fetch should get example2.txt content', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#fetch_one').innerText).eql('this is the second text file example (example2.txt)');
});
