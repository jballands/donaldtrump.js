//
//  index.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import colors from 'colors';
import Digester from './data/Digester';
import env from './utils/env';

// -----------------------------------------------------------------------------

// If not prod, work interactively
if (env.isProd === false) {
    console.info('donaldtrump.js is working interactively'.cyan);
}

// First, try to connect the Digester to the DB
const d = new Digester();
