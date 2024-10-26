/* eslint-disable no-restricted-syntax */
const _random = require('lodash/random');
const {logger} = require('../utils');

const watchVideosInSequence = async (page, ipAddr, targetUrlsList, durationInSeconds) => {
    for (const url of targetUrlsList) {
        await page.goto(url, {timeout: 60000, waitUntil: 'load'});
        try {
            await page.waitForSelector('.ytd-watch-metadata', {timeout: 5000});
            //await page.mouse.click(100, 100);
            const duration = (durationInSeconds + _random(-(durationInSeconds / 6), (durationInSeconds / 6), true));
            await new Promise((resolve, reject) => setTimeout(resolve, duration * 1000));
            await logger.logCount(page, url, ipAddr, duration);
        } catch (e) {
            logger.error(e);
            logger.logFailedAttempt(url, ipAddr);
        }
    }
};

module.exports = {watchVideosInSequence};
