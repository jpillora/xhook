import { Selector } from 'testcafe';

fixture `Real upload events`
  .page `http://localhost:3000/#progress-upload-real`;

test('should complete with real upload events', async t => {
  const result = Selector('#events');

  await t
    .switchToIframe('iframe')
    .expect(result.innerText).eql('readyState 1\n' +
      'sending #288889 chars\n' +
      'hooked xhr though left untouched!\n' +
      'upload started\n' +
      '100\n' +
      'upload complete\n' +
      'readyState 2\n' +
      'readyState 3\n' +
      'readyState 4\n');
});

