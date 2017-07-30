import { Selector } from 'testcafe';

fixture `Real download events`
  .page `http://localhost:3000/#progress-download-real`;

test('should complete with real download events', async t => {
  const result = Selector('#events');

  await t
    .switchToIframe('iframe')
    .expect(result.innerText).contains('readyState 1\n' +
      'hooked xhr though left untouched!\n' +
      'readyState 2\n' +
      'readyState 3\n')
    .expect(result.innerText).contains(
      'readyState 3\n' +
      '100\n' +
      'readyState 3\n' +
      'readyState 4\n');
});

