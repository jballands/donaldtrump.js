//
//  utils/args.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import process from 'process';

// -----------------------------------------------------------------------------

const args = {
    noPoll: false,
    pollIntervalHr: 2
};

for (let arg of process.argv.splice(2)) {
    const [key, value] = arg.split('=');
    args[key] = JSON.parse(value);
}

export default args;
