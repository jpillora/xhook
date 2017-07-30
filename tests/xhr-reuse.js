import { Selector } from 'testcafe';

fixture `XHR Reuse`
  .page `http://localhost:3000/#xhr-reuse`;

test('example 1 should return example1.txt', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#one').innerText).eql('this is the first text file example (example1.txt)');
});

test('example 2 should return example2.txt', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#two').innerText).eql('this is the second text file example (example2.txt)');
});
