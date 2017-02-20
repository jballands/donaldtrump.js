//
//  Tweeter.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import request from 'request';
import colors from 'colors';
import Tweet from './models/Tweet';
import MarkovChain from './utils/MarkovChain';
import options from './utils/options';
import env from './utils/env';

// -----------------------------------------------------------------------------

export default class Tweeter {

    constructor(authenticator) {
        this.authenticator = authenticator;
    }

    beginPolling() {
        if (typeof options.tweetingIntervalHours !== 'number') {
            return console.error(`ERROR: No tweetingIntervalHours in options.json. Please add it.`.red);
        }

        setInterval(() => {
            this.postTweet()
                .catch(err => console.err(err));
        }, options.tweetingIntervalHours * 1000 * 60 * 60);
    }

    getTweet() {
        return new Promise((resolve, reject) => {
            console.info('WAIT: Generating tweet...'.magenta);

            Tweet.find({ handle: { $in: options.accounts }}, (err, tweets) => {
                const markov = new MarkovChain(options.markovOrder);

                // If there's a genesis account, seed those as the genesis
                const genesis = options.genesis;
                if (genesis) {
                    markov.seed(tweets.filter(t => t.handle === genesis).map(t => t.value), true);
                    markov.seed(tweets.filter(t => t.handle !== genesis).map(t => t.value), false);
                }
                else {
                    markov.seed(tweets.map(t => t.value), true);
                }

                // Actually return a tweet
                let tweet = markov.generateRandomly(140);
                resolve(this._tweetHelper(tweet));
            });
        });
    }

    postTweet() {
        return new Promise((resolve, reject) => {
            let user = null;

            this.authenticator.getAuthenticatedAccount()
                .then(_user => {
                    user = _user;
                    return this.getTweet();
                })
                .then(tweet => {
                    console.info('Tweet generation successful!'.green);
                    console.info(`${tweet.length} > ${tweet}`.cyan);
                    console.info(`WAIT: Posting to @${user.handle}...`.magenta);
                    return this._postTweet(tweet, user);
                })
                .then(() => {
                    console.info('Post successful!'.green);
                    resolve();
                })
                .catch(err => {
                    reject(`ERROR: Failed to post to Twitter. ${err.message}`);
                });
        });
    }

    // PRIVATE -----------------------------------------------------------------

    _postTweet(tweet, user) {
        return new Promise((resolve, reject) => {
            const args = {
                url: `https://api.twitter.com/1.1/statuses/update.json`,
                oauth: {
                    consumer_key: env.twitter.consumerKey,
                    consumer_secret: env.twitter.consumerSecret,
                    token: user.token,
                    token_secret: user.tokenSecret
                },
                form: {
                    status: tweet
                }
            };

            if (!args.oauth.consumer_key || !args.oauth.consumer_secret) {
                return reject(new Error(`No consumerKey and/or consumerSecret` +
                    ` set on environment. Please set these variables.`));
            }

            request.post(args, (err, res, body) => {
                resolve();
            });
        });
    }

    _tweetHelper(tweet) {
        tweet = this._newLines(tweet, options.newLines);
        tweet = this._replies(tweet, options.replies);
        tweet = this._mentions(tweet, options.mentions);
        // tweet = this._links(tweet, options.links);
        return tweet;
    }

    _replies(tweet, mode) {
        if (mode === true) {
            return tweet;
        }
        return tweet.replace(/^@/g, '.@');
    }

    _newLines(tweet, mode) {
        if (mode === true) {
            return tweet;
        }
        return tweet.replace(/\n/g, ' ');
    }

    _mentions(tweet, mode) {
        if (mode === true) {
            return tweet;
        }
        return tweet.replace(/(\s@|^.@|^@)/g, ' ');
    }

    /*_links(tweet, mode) {
        if (mode === true) {
            return tweet;
        }
        return tweet.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    }*/

}
