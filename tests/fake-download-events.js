import { Selector } from 'testcafe';

fixture `Fake download events`
  .page `http://localhost:3000/#progress-download-fake`;

test('should complete with fake download events', async t => {
  const result = Selector('#events');

  await t
    .switchToIframe('iframe')
    .expect(result.innerText).eql('readyState 1\n' +
      '0\n' +
      'readyState 2\n' +
      'readyState 3\n' +
      '13\n' +
      'readyState 3\n' +
      '26\n' +
      'readyState 3\n' +
      '39\n' +
      'readyState 3\n' +
      '52\n' +
      'readyState 3\n' +
      '65\n' +
      'readyState 3\n' +
      '78\n' +
      'readyState 3\n' +
      '91\n' +
      'readyState 3\n' +
      '100\n' +
      'readyState 3\n' +
      'readyState 4\n');
});

