//
//  utils/MarkovChain.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import _chunk from 'lodash.chunk';
import _random from 'lodash.random';

// -----------------------------------------------------------------------------

export default class MarkovChain {

    corpus = {};
    starters = [];

    constructor(tweets, order) {
        for (const tweet of tweets) {
            const words = tweet.split(' ');
            const chunks = _chunk(words, order);

            for (let i = 0 ; i < chunks.length ; i++) {
                const chunk = chunks[i];

                // Is this the first chunk? If so, add it to starters
                if (i === 0) {
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

    generateRandomly() {
        // Choose a random chunk to begin
        const randoChunk = this.starters[_random(0, this.starters.length - 1)];

        let tweetBuilder = randoChunk;
        let lastChunk = randoChunk;

        // While the chunk doesn't terminate, keep adding to the tweet
        while (lastChunk != null) {
            // From the possibleNextChunks, choose a random chunk
            const possibleNextChunks = this.corpus[lastChunk];

            // console.log(`${JSON.stringify(lastChunk)} -> ${JSON.stringify(possibleNextChunks)}`);

            lastChunk = possibleNextChunks[_random(0, possibleNextChunks.length -1)];
            tweetBuilder = tweetBuilder.concat(lastChunk);
        }

        return tweetBuilder.join(' ');
    }
}
