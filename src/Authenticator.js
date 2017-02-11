//
//  Authenticator.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import process from 'process';
import request from 'request';
import qs from 'query-string';
import colors from 'colors';
import _assign from 'lodash.assign';
import User from './models/User';
import env from './utils/env';

// -----------------------------------------------------------------------------

export default class Authenticator {

    constructor() {
        this.user = null;
    }

    getAuthenticatedAccount() {
        return new Promise((resolve, reject) => {
            this._getUsers()
                .then(users => {
                    if (users.length === 1) {
                        return resolve(users[0]);
                    }
                    else if (env.isProd === false) {
                        return this._handleUnexpectedUsers(users)
                            .then(user => {
                                this.user = user;
                                return resolve(user);
                            })
                            .catch(err => reject(err));
                    }
                    else {
                        return reject(new Error(`ERROR: Unexpected number of users: ${users.length}.
                            Run donaldtrump.js in interactive mode first to correct issue
                            then rerun in production mode, or seed db with exactly one user.`));
                    }
                })
                .catch(error => reject(error));
        });
    }

    // PRIVATE -----------------------------------------------------------------

    _getUsers() {
        return new Promise((resolve, reject) => {
            // If there's already a user, just use it
            if (this.user !== null) {
                return resolve(user);
            }

            User.find((err, users) => {
                if (err) {
                    return reject(err);
                }

                resolve(users);
            });
        });
    }

    _handleUnexpectedUsers(users) {
        return new Promise((resolve, reject) => {
            if (users.length === 0) {
                console.warn(`WARN: No accounts in db, starting authentication
                    with Twitter...`.yellow);
                return this._authenticateWithTwitter()
                    .then(user => resolve(user))
                    .catch(error => reject(error));
            }
            else {
                console.warn(`WARN: Too many accounts in db. You must delete some
                    in order to continue.`.yellow);
            }
        });
    }

    _authenticateWithTwitter() {
        return new Promise((resolve, reject) => {
            const apiKey = env.twitter.consumerKey;
            const apiSecret = env.twitter.consumerSecret;

            if (!apiKey || !apiSecret) {
                return reject(new Error(`ERROR: No consumerKey and/or consumerSecret
                    set on environment. Please set these variables.`));
            }

            const oAuth = {
                callback: 'oob',
                consumer_key: apiKey,
                consumer_secret: apiSecret
            };

            // Because OAuth is a giant asshole, I've broken down each leg of
            // Twitter's three-legged OAuth into function that return promises,
            // then string those functions together.

            const beginOAuth = () => new Promise((resolve, reject) => {
                const args = {
                    url: 'https://api.twitter.com/oauth/request_token',
                    oauth: oAuth
                };

                request.post(args, (err, res, body) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(qs.parse(body));
                });
            });

            const requestPIN = tokens => new Promise((resolve, reject) => {
                const uri = `https://api.twitter.com/oauth/authenticate?oauth_token=${tokens.oauth_token}`;

                console.info(`INFO: Open a browser and enter this URL: ${uri}`.cyan);
                console.info(`INFO: Once authorized, please enter the pin.`.cyan);

                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdout.write('PIN? ');
                process.stdin.on('data', pin => {
                    process.stdin.pause();
                    return resolve({
                        pin: pin.trim(),
                        token: tokens.oauth_token,
                        secret: tokens.oauth_token_secret
                    });
                });
            });

            const getAccessToken = tokens => new Promise((resolve, reject) => {
                const args = {
                    url: `https://api.twitter.com/oauth/access_token`,
                    oauth: _assign({}, oAuth, {
                        token: tokens.token,
                        token_secret: tokens.secret,
                        verifier: tokens.pin
                    })
                };

                request.post(args, (err, res, body) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(qs.parse(body));
                });
            });

            const writeUserToDB = tokens => new Promise((resolve, reject) => {
                const u = new User({
                    token: tokens.oauth_token,
                    tokenSecret: tokens.oauth_token_secret,
                    id: tokens.user_id,
                    userName: tokens.screen_name
                });

                u.save(err => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(u);
                });
            });

            // Actually do the OAuth
            const u = beginOAuth()
                .then(tokens => requestPIN(tokens))
                .then(tokens => getAccessToken(tokens))
                .then(tokens => writeUserToDB(tokens))
                .then(user => {
                    console.info('Log in succeeded!'.green);
                    return resolve(user);
                })
                .catch(err => reject(err));
        });
    }

    _deleteAccounts() {
        console.error('ERROR: Account deletion not yet implemented'.red);
    }

}
