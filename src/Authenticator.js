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
                console.warn(`WARN: No accounts in database. Starting authentication`.yellow +
                    ` with Twitter...`.yellow);
                return this._authenticateWithTwitter()
                    .then(user => resolve(user))
                    .catch(error => reject(error));
            }
            else {
                console.warn(`WARN: Too many accounts in database. You must delete some`.yellow +
                    ` in order to continue.`.yellow);
            }
        });
    }

    _authenticateWithTwitter() {
        return new Promise((resolve, reject) => {
            const apiKey = env.twitter.consumerKey;
            const apiSecret = env.twitter.consumerSecret;

            if (!apiKey || !apiSecret) {
                return reject(new Error(`No consumerKey and/or consumerSecret` +
                    ` set on environment. Please set these variables.`));
            }

            const oAuth = {
                callback: 'oob',
                consumer_key: apiKey,
                consumer_secret: apiSecret
            };

            // This function returns a promise that tells Twitter we're going
            // to start the three-legged OAuth sequence, returning the tokens
            // needed to generate a PIN
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

            // This function returns a promise that generates a authentication url
            // and returns it to the user, then waits for a PIN. When the user
            // enters the PIN, it returns that PIN
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

            // This function returns a promise that asks Twitter for access tokens
            // given tokens from the authentication URL and PIN, returning all
            // tokens neccessary to authenticate successfully with Twitter in
            // the future
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

            // This function returns a promise that saves all Twitter authentication
            // tokens in the database for future reference
            const writeUserToDB = tokens => new Promise((resolve, reject) => {
                const u = new User({
                    token: tokens.oauth_token,
                    tokenSecret: tokens.oauth_token_secret,
                    id: tokens.user_id,
                    handle: tokens.screen_name
                });

                u.save(err => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(u);
                });
            });

            // Begin the promise chain
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
