import puppeteer from 'puppeteer';

console.log('Imports done');

async(() { 
    const LOGIN_URL = 'https://twitter.com/i/flow/login';
    const USERNAME_INPUT_SELECTOR = 'input[name="text"]'

    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    console.log('Browser loaded...');

    await page.goto(TWITTER_LOGIN_URL);

    console.log('Twitter loaded...');

    const usernameInput = await page.waitForSelector(USERNAME_INPUT_SELECTOR);
    usernameInput.click();
    usernameInput.type('USERNAME HERE');

    const firstLoginbutton = await page.waitForSelector('text/Next');
    firstLoginbutton.click();

    console.log(firstLoginbutton);

    await browser.close();

});

