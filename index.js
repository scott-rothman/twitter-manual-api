import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import puppeteer from 'puppeteer';
console.log('Imports done...');

const LOGIN_URL = 'https://twitter.com/i/flow/login';

console.log('Constants initialized...');


(async () => {

    const [browser, page] = await initializeConnection();

    console.log('Connection initalized...');

    await login(browser, page);
    console.log('Login successful...');

    await createTextTweet(browser, page);
})();

function initializeConnection() {
    return new Promise(async (resolve) => {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: '.manual-twitter-data'
        });
    
        const page = await browser.newPage();
        
        const toResolve = [browser, page];
        resolve(toResolve);
    });
}

function login(browser, page) {
    return new Promise(async (resolve, reject) => {
        const rl = readline.createInterface({input, output})
        const USERNAME = await rl.question('username: ');
        const PASSWORD = await rl.question('pass: ');
        const USERNAME_INPUT_SELECTOR = 'input[name="text"]';
        const PASSWORD_INPUT_SELECTOR = 'input[name="password"]';

        await page.goto(LOGIN_URL);

        const usernameInput = await page.waitForSelector(USERNAME_INPUT_SELECTOR);
        await usernameInput.click();
        await usernameInput.type(USERNAME);

        const firstLoginbutton = await page.waitForSelector('text/Next');
        await firstLoginbutton.click();

        const passwordInput = await page.waitForSelector(PASSWORD_INPUT_SELECTOR);
        await passwordInput.type(PASSWORD);

        const secondLoginButton = await page.waitForSelector('text/Log in');
        await secondLoginButton.click();

        console.log('checking page target');
        await browser.waitForTarget((target) => {
            if (target.url() === 'https://twitter.com/home') {
                resolve();
            }
        });
    });
}

function createTextTweet(browser, page) {
    return new Promise(async (resolve) => {
        setTimeout(async () => {
            console.log('Step 0');
            const tweetButton = await page.waitForSelector('[data-testid="SideNav_NewTweet_Button"]');
            console.log('Step 1');
            await tweetButton.click();
            console.log('Step 1.5');

            const tweetTextField = await page.waitForSelector('.public-DraftEditor-content');
            await tweetTextField.click();
            console.log('Step 2');
            await tweetTextField.type('This tweet was sent automatically without using the twitter api');
            console.log('Step 3');

            const submitTweetButton = await page.waitForSelector('[data-testid="tweetButton"]');
            console.log('Step 4');
            await submitTweetButton.click();
            console.log('Step 5');
        }, 5000);
    });
}
