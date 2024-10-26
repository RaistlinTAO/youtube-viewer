const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const _compact = require('lodash/compact');
const _isEmpty = require('lodash/isEmpty');
const _toString = require('lodash/toString');

const logger = require('./logger');

const urlReader = (filename) => {
    try {
        const fileContents = _toString(fs.readFileSync(path.resolve(process.cwd(), filename)));
        const urlArray = _compact(fileContents.split('\n'));
        if (_isEmpty(urlArray)) throw new Error(`No urls found. Make sure ${filename} contains at least one url to proceed`);
        return urlArray;
    } catch (error) {
        logger.error('An error occurred while reading urls');
        logger.debug(error);
        throw new Error();
    }
};

const urlCSVReader = (filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.resolve(process.cwd(), filename);
        const urls = [];

        fs.createReadStream(filePath)
            .on('error', (error) => {
                logger.error(`Failed to open file: ${filename}`);
                logger.debug(error);
                reject(new Error(`File read error: ${filename}`));
            })
            .pipe(csv())
            .on('data', (row) => {
                logger.debug(`Loaded row: ${JSON.stringify(row)}`); // 调试输出
                if (row.url && row.duration) {
                    urls.push({ url: row.url, duration: Number(row.duration) });
                } else {
                    logger.warn(`Invalid row, missing url or duration: ${JSON.stringify(row)}`);
                }
            })
            .on('end', () => {
                if (urls.length === 0) {
                    const error = new Error(`No valid URLs found in ${filename}.`);
                    logger.error(error.message);
                    reject(error);
                } else {
                    //logger.info(`URLs loaded: ${JSON.stringify(urls)}`);
                    resolve(urls);
                }
            });
    });
};

module.exports = urlCSVReader;
