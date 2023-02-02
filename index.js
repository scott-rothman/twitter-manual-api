import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import puppeteer from 'puppeteer';
console.log('Imports done...');

const LOGIN_URL = 'https://twitter.com/i/flow/login';

const USERNAME_INPUT_SELECTOR = 'input[name="text"]';
const USERNAME_PASSWORD_SELECTOR = 'input[name="password"]';

const USERNAME = '';
const PASSWORD = '';
console.log('Constants initialized...');


(async () => {

    const [browser, page] = await initializeConnection();

    await login(browser, page);
})();

function initializeConnection() {
    return new Promise(async (resolve) => {
        const browser = await puppeteer.launch({
            headless: false,
        });
        console.log('Browser loaded...');
    
        const page = await browser.newPage();
        console.log('Page loaded...');
        
        const toResolve = [browser, page];
        resolve(toResolve);
    });
}

function login(browser, page) {
    return new Promise(async (resolve, reject) => {
        const rl = readline.createInterface({input, output})
        const USERNAME = await rl.question('username: ');
        const PASSWORD = await rl.question('pass: ');


        console.log('Logging in...');

        await page.goto(LOGIN_URL);
        console.log('Twitter loaded...');

        const usernameInput = await page.waitForSelector(USERNAME_INPUT_SELECTOR);
        await usernameInput.click();
        await usernameInput.type(USERNAME);

        const firstLoginbutton = await page.waitForSelector('text/Next');
        await firstLoginbutton.click();

        const passwordInput = await page.waitForSelector(USERNAME_PASSWORD_SELECTOR);
        await passwordInput.type(PASSWORD);

        const secondLoginButton = await page.waitForSelector('text/Log in');
        await secondLoginButton.click();

        await browser.waitForTarget((target) => {
            target.url() === 'https://twitter.com/home';
        });

        resolve();
    });
}

function createTextTweet(browser, page) {
    return new Promise(async (resolve) => {
        resolve();
    });
}
