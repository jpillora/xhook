import { Selector } from 'testcafe';

fixture `Events`
  .page `http://localhost:3000/#events`;

test('should complete with xhook events', async t => {
  const xhookResult = Selector('#xhook');

  await t
    .switchToIframe('iframe')
    .wait(3000) // compensate for a real 3s delay from the echo server
    .expect(xhookResult.innerText).contains('[before start]...\n' +
      '[before end]\n' +
      'readystatechange (2)\n' +
      'readystatechange (3)\n' +
      'progress (3)\n' +
      'readystatechange (3)\n' +
      'readystatechange (4)\n' +
      'load (4)\n' +
      ' => 200\n')
    .expect(xhookResult.innerText).contains('loadend (4)');
});

