//
//  utils/MarkovChain.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import _chunk from 'lodash.chunk';
import _flatten from 'lodash.flatten';
import _random from 'lodash.random';
import sentenceTokenizer from './sentenceTokenizer';

const TWEET_COMPLETION_THRESHOLD = 0.8;

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
            // Split into sentences
            const sentences = sentenceTokenizer(tweet);
            const chunkedSentences = sentences.map(s => _chunk(s.split(' '), this.order));

            // Append the flattened sentece structure to the chuncked sentences
            // so that the algorithm has an opportunity to make a longer tweet
            // if it wants to
            chunkedSentences.push(_flatten(chunkedSentences));

            // For every sentence in the chunked sentences, seed the Markov chain
            for (const chunked of chunkedSentences) {
                for (let i = 0 ; i < chunked.length ; i++) {

                    // Use a corpus ref so that the corpus keys don't care about
                    // capitalization
                    const chunk = chunked[i];
                    const corpusRef = chunk.map(p => p.toLowerCase());

                    // Is this the first chunk? If so, add it to starters
                    if (i === 0 && allowAsGenesis === true) {
                        this.starters.push(chunk);
                    }

                    // If the word doesn't exist in the corpus yet, add it
                    if (!this.corpus[corpusRef]) {
                        this.corpus[corpusRef] = [];
                    }

                    // If there's nothing to look ahead to, just put in null as a terminator
                    if (i === chunked.length - 1) {
                        this.corpus[corpusRef].push(null);
                    }
                    else {
                        this.corpus[corpusRef].push(chunked[i + 1]);
                    }
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

        // While the chunk doesn't terminate, keep adding to the tweet
        while (lastChunk != null) {

            // The current tweet builder length
            const tweetBuilderLength = this.stringArrayLength(tweetBuilder);

            // This number represents the percent completion
            const tweetCompletion = tweetBuilderLength / maxChar;

            // From the possibleNextChunks, choose a random chunk
            // We create a corpus ref since the corpus keys are agnostic to
            // capitalization
            const corpusRef = lastChunk.map(p => p.toLowerCase());
            const possibleNextChunks = this.corpus[corpusRef];

            // If there's nothing in the corpus, terminate early
            if (!possibleNextChunks) {
                lastChunk = null;
                continue;
            }

            // Generate a length of all words in the chunks
            const possibleNextChunkLengths = possibleNextChunks.map(chunk => this.stringArrayLength(chunk));

            // If we are getting close to the limit, try and close the tweet
            if (tweetCompletion >= TWEET_COMPLETION_THRESHOLD && possibleNextChunks.indexOf(null) >= 0) {
                lastChunk = null;
            }
            // But we're still getting close to an overflow... only pick short chunks
            else if (tweetCompletion >= TWEET_COMPLETION_THRESHOLD) {
                const smallest = possibleNextChunkLengths.reduce((acc, curr) => acc < curr ? acc : curr);
                lastChunk = possibleNextChunks[possibleNextChunkLengths.indexOf(smallest)];
            }
            // If there's no terminator, just pick one at random
            else {
                lastChunk = possibleNextChunks[_random(0, possibleNextChunks.length -1)];
            }
            // Append to tweet
            tweetBuilder = tweetBuilder.concat(lastChunk);
        }

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
