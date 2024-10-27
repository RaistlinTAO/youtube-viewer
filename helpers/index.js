/* eslint-disable no-restricted-syntax */
const _random = require('lodash/random');
const {logger} = require('../utils');

const refererUrls = ['https://www.google.com', 'https://www.bing.com', 'https://duckduckgo.com', 'https://www.yahoo.com'];

async function ensurePlaying(page) {
    const isPlaying = await page.evaluate(() => {
        const playButton = document.querySelector('.ytp-play-button');
        return playButton && playButton.getAttribute('aria-label') === 'Pause (k)';
    });

    if (!isPlaying) {
        logger.warn('Video is not playing, attempting to play...');
        await page.click('.ytp-play-button'); // 点击播放按钮
        // 等待短暂时间以确认按钮响应
        await new Promise(resolve => setTimeout(resolve, 1000));
        return ensurePlaying(page); // 递归调用检查播放状态
    } else {
        logger.info('Video is confirmed to be playing.');
    }
}

const watchVideosInSequence = async (page, ipAddr, targetUrlsList, durationInSeconds) => {
    const randomReferer = refererUrls[Math.floor(Math.random() * refererUrls.length)];
    for (const urlInfo of targetUrlsList) {
        // await page.setUserAgent(randomUseragent.getRandom(function (ua) {
        //     return parseFloat(ua.browserVersion) >= 30;
        // }));
        await page.setExtraHTTPHeaders({referer: randomReferer});
        await page.goto(urlInfo.url, {timeout: 120000, waitUntil: 'load'});
        try {
            await page.waitForSelector('.ytp-play-button', {timeout: 5000});
            await ensurePlaying(page);
            //await page.mouse.click(100, 100);
            const watchTime = Math.random() < 95 / 100 ? urlInfo.duration * 1 : Math.random() * urlInfo.duration;
            const startTime = Date.now();
            await page.waitForFunction(
                (startTime, watchTime) => Date.now() - startTime >= watchTime * 1000,
                {},
                startTime,
                watchTime
            );
            //await new Promise((resolve) => setTimeout(resolve, watchTime * 1000));
            await logger.logCount(page, urlInfo.url, ipAddr, watchTime);
        } catch (e) {
            logger.error(e);
            logger.logFailedAttempt(urlInfo.url, ipAddr);
        }
    }
};

module.exports = {watchVideosInSequence};
