import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'node:fs';

export function createPhotoTweet(browser, page, imagePath) {
    return new Promise(async (resolve) => {

        const tweetButton = await page.waitForSelector('[data-testid="SideNav_NewTweet_Button"]');
        await tweetButton.click();

        const uploadPhotoButton = await page.waitForSelector('aria/Add photos or video');
        const [photoFileChooser] = await Promise.all([
            page.waitForFileChooser(),
            uploadPhotoButton.click(),
        ]);

        await photoFileChooser.accept([imagePath]);

        const submitTweetButton = await page.waitForSelector('[data-testid="tweetButton"]');
        await submitTweetButton.click();

        await page.waitForNetworkIdle();
        resolve();
    });
}

export async function initializePhotoPosts(browser, page) {
    const rl = readline.createInterface({input, output});
    const postFrequency = await rl.question('Frequency of posts: ');
    rl.close();

    
    setInterval(generatePhotoPostCB, postFrequency, browser, page);
}

export async function generatePhotoPostCB(browser, page) {
    const files = fs.readdirSync('./image_posts/new', {
        withFileTypes: false
    });
    
    files.sort((a, b) => {
        return fs.statSync(`./image_posts/new/${a}`).mtime.getTime() - fs.statSync(`./image_posts/new/${b}`).mtime.getTime();
    });

    if (files.length <= 0) {
        throw new Error('No images found in expected path: (./image_posts/new)');
    }

    const oldFilePath = `./image_posts/new/${files[0]}`;
    const newFilePath = `./image_posts/posted/${files[0]}`
    console.log(oldFilePath, newFilePath);

    console.log('posting!');
    await createPhotoTweet(browser, page, oldFilePath);

    console.log('renaming!');
    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
            console.log('twas an err', err);
        }
    });
}
