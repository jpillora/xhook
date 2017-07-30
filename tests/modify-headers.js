import { Selector } from 'testcafe';

fixture `Modify Headers`
  .page `http://localhost:3000/#modify-headers`;

test('response should include Foo Header', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#res').innerText).contains('foo:\tBar');
});
