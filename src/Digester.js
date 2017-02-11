//
//  Digester.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import Mongoose from 'mongoose';
import colors from 'colors';
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
                console.log(JSON.stringify(user));
                console.log('SUCCEEDED!');
                done();
            })
            .catch(err => {
                console.error(`ERROR: Failed to fetch an authenticated user.`);
                console.error(err.message.red);
                done();
            });
    }

}
