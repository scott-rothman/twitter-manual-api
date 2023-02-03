import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';

export function createTextTweet(browser, page, tweetText = '') {
    return new Promise(async (resolve) => {
        if (tweetText.length <= 0) {
            tweetText = 'Sample data for automated tweet sans api';
        }
        const tweetButton = await page.waitForSelector('[data-testid="SideNav_NewTweet_Button"]');
        await tweetButton.click();

        const tweetTextField = await page.waitForSelector('.public-DraftEditor-content');
        await tweetTextField.click();
        await tweetTextField.type(tweetText);

        const submitTweetButton = await page.waitForSelector('[data-testid="tweetButton"]');
        await submitTweetButton.click();

        await page.waitForNetworkIdle();
        resolve();
    });
}

export async function initializeTextPosts(browser, page) {
    console.log('Frequency needs to be 5000 or larger to ensure each tweet can be successfully posted.  Larger is safer.');
    const rl = readline.createInterface({input, output});
    let postFrequency = await rl.question('Time between posts: ');
    while (postFrequency < 5000) {
        postFrequency = await rl.question('Err. Duration too short. \n\n Time: ');
    }
    rl.close();
    setInterval(generateTextPostCB, postFrequency, browser, page);
}

export async function generateTextPostCB(browser, page) {
    const files = fs.readdirSync('./text_posts/new', {
        withFileTypes: false
    });

    if (files.length <= 0) {
        throw new Error('No text files found in expected path: (./text_posts/new)');
    }
    
    files.sort((a, b) => {
        return fs.statSync(`./text_posts/new/${a}`).mtime.getTime() - fs.statSync(`./text_posts/new/${b}`).mtime.getTime();
    });

    const tweetText = await fsp.readFile(`./text_posts/new/${files[0]}`, {encoding: 'utf8'});

    await createTextTweet(browser, page, tweetText);

    const oldFilePath = `./text_posts/new/${files[0]}`;
    const newFilePath = `./text_posts/posted/${files[0]}`
    console.log(oldFilePath, newFilePath);
    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
            console.log('twas an err', err);
        }
    });
}
