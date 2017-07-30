import { Selector } from 'testcafe';

fixture `Add Event Listeners`
  .page `http://localhost:3000/#add-event-listener`;

test('Should add event listeners to XHR', async t => {
  await t
    .switchToIframe('iframe')
    .expect(Selector('#one').innerText).eql('thzs zs thz szcznd tzxt fzlz zxzmplz (zxzmplz2.txt)')
    .expect(Selector('#status').innerText).eql('loaded!!!');
});
