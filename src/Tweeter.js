//
//  Tweeter.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import Tweet from './models/Tweet';
import MarkovChain from './utils/MarkovChain';
import options from './utils/options';

// -----------------------------------------------------------------------------

export default class Tweeter {

    constructor(authenticator) {
        this.authenticator = authenticator;
    }

    generateTweet(done) {
        return new Promise((resolve, reject) => {
            Tweet.find((err, tweets) => {
                const markov = new MarkovChain(tweets.map(t => t.value), options.markovOrder);
                console.log(markov.generateRandomly());

                if (done) done();
            });
        });
    }

}
