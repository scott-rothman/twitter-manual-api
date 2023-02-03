import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import puppeteer from 'puppeteer';

import {initializePhotoPosts} from './functions/singleImagePost.js';
import {initializeTextPosts} from './functions/singleTextPost.js';


console.log('Imports done...');

/** Constants */
const COMPOSE_TWEET_URL = 'https://twitter.com/home';
const LOGIN_URL = 'https://twitter.com/i/flow/login';

/* Global Vars */
let isLoggedIn = false;


(async () => {
    const [browser, page] = await initializeConnection();
    console.log('Connection initalized...');

    if (!isLoggedIn) {
        await login(browser, page);
        console.log('Login successful...');
    } else {
        console.log('Already logged in...');
    }

    let selectedAction = await getUserAction();

    switch (selectedAction) {
        case 'text':
            initializeTextPosts(browser, page);
            break;
        case 'photos':
            initializePhotoPosts(browser, page);
    }
})();

function getUserAction() {
    return new Promise(async (resolve) => {
        const rl = readline.createInterface({input, output});

        console.log('Select an automation: \n\n 1. Text post \n 2. Photo post');
        const userSelection = await rl.question('(1 or 2): ');
        if (userSelection === '1') {
            rl.close();
            resolve('text');
        } else if (userSelection === '2'){
            rl.close();
            resolve('photos')
        }
    });
}

function initializeConnection() {
    return new Promise(async (resolve) => {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: '.manual-twitter-data'
        });
    
        const page = await browser.newPage();
        
        await page.goto(COMPOSE_TWEET_URL);
        await page.waitForNetworkIdle();
        await browser.waitForTarget((target) => {
            if (target.url() === LOGIN_URL) {
                isLoggedIn = false;
                const toResolve = [browser, page];
                resolve(toResolve);
            } else if (target.url() === COMPOSE_TWEET_URL) {
                isLoggedIn = true;
                const toResolve = [browser, page];
                resolve(toResolve);
            }
        }, {
            timeout: 0
        });
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
        
        rl.close();

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
            console.log(target.url());
            if (target.url() === 'https://twitter.com/home') {
                resolve();
            }
        }, 1000);
    });
}

