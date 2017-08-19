import { Selector } from 'testcafe';

fixture `Angular`
  .page `http://localhost:3000/#angular`;

test('example 1 response should not be modified', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#one').innerText).eql('this is the first text file example (example1.txt)');
});

test('example 2 response should be modified', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#two').innerText).eql('thzs zs thz szcznd tzxt fzlz zxzmplz (zxzmplz2.txt)');
});
