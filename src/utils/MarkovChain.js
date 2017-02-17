//
//  utils/MarkovChain.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import _chunk from 'lodash.chunk';
import _random from 'lodash.random';

const TWEET_COMPLETION_THRESHOLD = 0.92;

// -----------------------------------------------------------------------------

export default class MarkovChain {

    corpus = {};
    starters = [];
    order = 2;

    constructor(order) {
        this.order = order;
    }

    seed(tweets, allowAsGenesis) {
        for (const tweet of tweets) {
            const words = tweet.split(' ');
            const chunks = _chunk(words, this.order);

            for (let i = 0 ; i < chunks.length ; i++) {
                const chunk = chunks[i];

                // Is this the first chunk? If so, add it to starters
                if (i === 0 && allowAsGenesis === true) {
                    this.starters.push(chunk);
                }

                // If the word doesn't exist in the corpus yet, add it
                if (!this.corpus[chunk]) {
                    this.corpus[chunk] = [];
                }

                // If there's nothing to look ahead to, just put in null as a terminator
                if (i === chunks.length - 1) {
                    this.corpus[chunk].push(null);
                }
                else {
                    this.corpus[chunk].push(chunks[i + 1]);
                }
            }
        }
    }

    generateRandomly(maxChar) {
        // Choose a random chunk to begin
        const randoChunk = this.starters[_random(0, this.starters.length - 1)];
        return this.generateGivenChunk(randoChunk, maxChar);
    }

    generateGivenChunk(chunk, maxChar) {
        if (!chunk || chunk === []) {
            return null;
        }

        let tweetBuilder = chunk;
        let lastChunk = chunk;

        console.info(`${lastChunk.join(' ')} ${' -> '.red} ${'?'.yellow}`);

        // While the chunk doesn't terminate, keep adding to the tweet
        while (lastChunk != null) {
            // The current tweet builder length
            const tweetBuilderLength = this.stringArrayLength(tweetBuilder);

            // This number represents the percent completion
            const tweetCompletion = tweetBuilderLength / maxChar;

            // From the possibleNextChunks, choose a random chunk
            const possibleNextChunks = this.corpus[lastChunk];

            // If there's nothing in the corpus, terminate early
            if (!possibleNextChunks) {
                lastChunk = null;
                continue;
            }

            // Generate a length of all words in the chunks
            const possibleNextChunkLengths = possibleNextChunks.map(chunk => this.stringArrayLength(chunk));

            // If we are getting close to the limit, try and close the tweet
            if (tweetCompletion >= TWEET_COMPLETION_THRESHOLD && possibleNextChunks.indexOf(null) >= 0) {
                console.info(`0.92 threshold reached`.red);
                console.info(`${JSON.stringify(possibleNextChunks)} -> ${'null'.red}`);
                lastChunk = null;
            }
            // But we're still getting close to an overflow... only pick short chunks
            else if (tweetCompletion >= TWEET_COMPLETION_THRESHOLD) {
                const smallest = possibleNextChunkLengths.reduce((acc, curr) => acc < curr ? acc : curr);
                lastChunk = possibleNextChunks[possibleNextChunkLengths.indexOf(smallest)];
                console.info(`0.92 threshold reached`.yellow);
                console.info(`${JSON.stringify(possibleNextChunks)} -> ${lastChunk !== null ? lastChunk.join(' ').blue : 'null'.blue}`);
            }
            // If there's no terminator, just pick one at random
            else {
                lastChunk = possibleNextChunks[_random(0, possibleNextChunks.length -1)];
                console.info(`${JSON.stringify(possibleNextChunks)} -> ${lastChunk !== null ? lastChunk.join(' ').blue : 'null'.blue}`);
            }
            // Append to tweet
            tweetBuilder = tweetBuilder.concat(lastChunk);
            console.info(`${tweetBuilder.join(' -> '.red)} ${'-> ?'.yellow}`);
            console.info(`New seed: ${lastChunk !== null ? lastChunk.join(' ') : 'null'}`.magenta);
        }

        console.info(`${tweetBuilder.join(' -> '.red)}`);

        return tweetBuilder.join(' ');
    }

    stringArrayLength(chunk) {
        if (chunk === null) {
            return -1;
        }

        return chunk.reduce((acc, curr) => {
            return acc + curr.length
        }, (chunk.length * this.order) - 1);
    }
}
