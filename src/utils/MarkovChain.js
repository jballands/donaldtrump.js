//
//  utils/MarkovChain.js
//
//  Markov chain wrapper around markov library with extra sugar.
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import markov from 'markov';

// -----------------------------------------------------------------------------

export default class MarkovChain {

    constructor() {
        this.m = markov(2);
    }

}
