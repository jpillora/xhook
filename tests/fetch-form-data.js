import { Selector } from 'testcafe';

fixture `Fetch With FormData`
  .page `http://localhost:3000/#fetch-form-data`;

test('should send username & password using FormData', async t => {
  // const result = Selector('#result');

  await t
    .switchToIframe('iframe')
    .typeText('#username', 'username')
    .typeText('#password', 'password')
    .click('#submit')
    .expect(Selector('#result').innerText).contains('"form": {\n' +
      '    "password": "password",\n' +
      '    "username": "username"\n' +
      '  }');
});
