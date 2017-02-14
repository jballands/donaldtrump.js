//
//  utils/args.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import process from 'process';
import colors from 'colors';
const options = require('../../options.json');

// -----------------------------------------------------------------------------

if (!options) {
    console.error('ERROR: No options.json file.'.red);
    process.exit(-1);
}

export default options;
