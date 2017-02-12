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
import args from './utils/args';

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
                console.warn(`WARN: No mongo uri set on environment, attempting
                    to connect to a local mongo instance.`.yellow);
                dbUri = 'mongodb://localhost/donaldtrump-js';
            }

            Mongoose.Promise = global.Promise;
            Mongoose.connect(dbUri);

            Mongoose.connection.on('open', () => {
                console.info('Connection to db succeeded!'.green);
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
        setInterval(() => {
            this.fetchTweets();
        }, args.pollIntervalHr * 1000 * 60 * 60);
    }

    fetchTweets(done) {
        this.authenticator.getAuthenticatedAccount()
            .then(user => {
                console.info(`INFO: Proceeding as @${user.userName}.`.cyan);
                return this._fetchTweets(user);
            })
            .then(tweets => {
                done();
            })
            .catch(err => {
                console.error(`ERROR: Failed to fetch an authenticated user.`);
                console.error(err.message.red);
                done();
            });
    }

    // PRIVATE -----------------------------------------------------------------

    _fetchTweets(user) {
        return new Promise((resolve, reject) => {
            const args = {
                url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&screen_name=realDonaldTrump',
                oauth: {
                    consumer_key: env.twitter.consumerKey,
                    consumer_secret: env.twitter.consumerSecret,
                    token: user.token,
                    token_secret: user.tokenSecret
                }
            };

            request.get(args, (err, res, body) => {
                const tweets = JSON.parse(body);
                const promises = [];

                for (const tweet of tweets) {
                    const t = new Tweet({
                        value: tweet.text,
                        date: new Date(tweet.created_at),
                        id: tweet.id
                    });

                    promises.push(new Promise((resolve, reject) => {
                        // If we already have the tweet, we don't save it again
                        Tweet.find({ id: tweet.id }, (err, tweets) => {
                            if (tweets.length > 0) {
                                return resolve(0);
                            }

                            t.save(err => {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(1);
                            });
                        });
                    }));
                }

                Promise.all(promises)
                    .then(vals => {
                        const total = vals.reduce((acc, curr) => acc + curr);
                        console.info(`INFO: Added ${total} tweets to db.`.cyan);
                        resolve();
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        });
    }

}
