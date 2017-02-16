//
//  Digester.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import Mongoose from 'mongoose';
import request from 'request';
import colors from 'colors';
import Tweet from './models/Tweet';
import env from './utils/env';
import options from './utils/options';

// -----------------------------------------------------------------------------

export default class Digester {

    canDigest = false;

    constructor(authenticator) {
        this.authenticator = authenticator;
    }

    connectToDB() {
        return new Promise((resolve, reject) => {
            // Use a local DB
            let dbUri = env.mongoUri;
            if (dbUri === undefined) {
                console.warn(`WARN: No mongo uri set on environment, attempting`.yellow +
                    ` to connect to a local mongo instance.`.yellow);
                dbUri = 'mongodb://localhost/donaldtrump-js';
            }

            Mongoose.Promise = global.Promise;
            Mongoose.connect(dbUri);

            Mongoose.connection.on('open', () => {
                console.info('Connection to database succeeded!'.green);
                this.canDigest = true;
                resolve(this);
            });

            Mongoose.connection.on('error', (err) => {
                console.error('ERROR: Connection to db failed.'.red);
                this.canDigest = false;
                reject(err);
            });
        });
    }

    beginPolling() {
        if (typeof options.pollingIntervalHours !== 'number') {
            return console.error(`ERROR: No pollingIntervalHours in options.json. Please add it.`.red);
        }

        setInterval(() => {
            this.fetchTweets()
                .catch(err => console.err(err));
        }, options.pollingIntervalHours * 1000 * 60 * 60);
    }

    fetchTweets() {
        return new Promise((resolve, reject) => {
            this.authenticator.getAuthenticatedAccount()
                .then(user => {
                    console.info(`INFO: Using @${user.handle} credentials to access Twitter.`.cyan);

                    const targetAccounts = options.accounts;
                    console.info(`WAIT: Fetching tweets from @${targetAccounts.join(', @')}...`.magenta);

                    return Promise.all(targetAccounts.map(acnt => this._fetchTweets(user, acnt)));
                })
                .then(tweets => {
                    resolve();
                })
                .catch(err => {
                    reject(`ERROR: Failed to fetch tweets. ${err.message}`);
                });
        });
    }

    // PRIVATE -----------------------------------------------------------------

    _fetchTweets(user, targetAccount) {
        return new Promise((resolve, reject) => {
            const args = {
                url: `https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&screen_name=${targetAccount}`,
                oauth: {
                    consumer_key: env.twitter.consumerKey,
                    consumer_secret: env.twitter.consumerSecret,
                    token: user.token,
                    token_secret: user.tokenSecret
                }
            };

            if (!args.oauth.consumer_key || !args.oauth.consumer_secret) {
                return reject(new Error(`No consumerKey and/or consumerSecret` +
                    ` set on environment. Please set these variables.`));
            }

            request.get(args, (err, res, body) => {
                const qwipTweets = JSON.parse(body);
                const promises = [];

                // This function gets all the tweets from the DB and cross-references
                // them with the tweets it got back from Twitter, ditching the
                // repeated tweets, only returning the unique ones that aren't in
                // the database
                const getUniqueTweets = () => new Promise((resolve, reject) => {
                    Tweet.find((err, storedTweets) => {
                        if (err) {
                            return reject(err);
                        }

                        const tweets = [];
                        const ids = storedTweets.map(t => t.id);
                        for (const t of qwipTweets) {
                            // If the tweet id from Twitter doesn't exist in the
                            // found tweets, add it to the unique tweets
                            if (ids.indexOf(t.id) < 0) {
                                tweets.push(new Tweet({
                                    value: t.text,
                                    date: new Date(t.created_at),
                                    handle: t.user.screen_name,
                                    id: t.id
                                }));
                            }
                        }

                        resolve(tweets);
                    });
                });

                // This function returns a Promise.all promise that saves all the
                // tweets that make it up
                const saveUniqueTweets = tweets => {
                    const promises = tweets.map(tweet => new Promise((resolve, reject) => {
                        tweet.save(err => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        });
                    }));

                    return Promise.all(promises);
                };

                // Begin the promise chain
                getUniqueTweets()
                    .then(tweets => saveUniqueTweets(tweets))
                    .then(tweets => {
                        console.info(`INFO: Added ${tweets.length} tweets from @${targetAccount} to database.`.cyan);
                        resolve();
                    })
                    .catch(err => reject(err));
            });
        });
    }

}
