//
//  Tweeter.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import colors from 'colors';
import Tweet from './models/Tweet';
import MarkovChain from './utils/MarkovChain';
import options from './utils/options';

// -----------------------------------------------------------------------------

export default class Tweeter {

    constructor(authenticator) {
        this.authenticator = authenticator;
    }

    getTweet() {
        return new Promise((resolve, reject) => {
            console.info('WAIT: Generating tweet...'.magenta);

            Tweet.find({ handle: { $in: options.accounts }}, (err, tweets) => {
                const markov = new MarkovChain(tweets.map(t => t.value), options.markovOrder);

                // Actually return a tweet
                let tweet = markov.generateRandomly(140);
                resolve(this.tweetHelper(tweet));
            });
        });
    }

    postTweet(tweet) {
        return new Promise((resolve, reject) => {
            this.authenticator.getAuthenticatedAccount()
                .then(user => {
                    console.info(`INFO: Using @${user.handle} credentials to access Twitter.`.cyan);

                    // TODO: Actually post the tweet
                })
                .then(tweets => {
                    done();
                })
                .catch(err => {
                    console.error(`ERROR: Failed to fetch tweets.`.red, err.message.red);
                    if (done) done();
                });
        });
    }

    tweetHelper(tweet) {
        tweet = this.scrubNewLines(tweet, options.scrubNewLines);
        tweet = this.suppressReplies(tweet, options.suppressReplies);
        tweet = this.scrubMentions(tweet, options.scrubMentions);
        tweet = this.scrubLinks(tweet, options.scrubLinks);
        return tweet;
    }

    suppressReplies(tweet, mode) {
        if (mode === false) {
            return tweet;
        }
        return tweet.replace(/^@/g, '.@');
    }

    scrubNewLines(tweet, mode) {
        if (mode === false) {
            return tweet;
        }
        return tweet.replace(/\n/g, ' ');
    }

    scrubMentions(tweet, mode) {
        if (mode === false) {
            return tweet;
        }
        return tweet.replace(/(\s@|^.@|^@)/g, ' ');
    }

    scrubLinks(tweet, mode) {
        if (mode === false) {
            return tweet;
        }
        return tweet.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    }

}
