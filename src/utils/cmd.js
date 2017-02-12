//
//  utils/cmd.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import process from 'process';
import util from 'util';

// -----------------------------------------------------------------------------

let BUSY = false;

export default function(digester) {
    console.info('INFO: donaldtrump.js is working interactively.'.cyan);

    makePrompt();

    process.stdin.on('data', i => {
        // If busy with something else, don't print anything here
        if (BUSY) {
            return;
        }

        process.stdin.pause();

        BUSY = true;
        switch (i.trim()) {
            case 'fetch':
                digester.fetchTweets(makePrompt); break;
            case 'quit':
                quit(makePrompt); break;
            default:
                help(makePrompt);
        }
    });
}

function help(done) {
    console.info('fetch'.yellow + ' - Fetches new tweets from @realDonaldTrump.');
    console.info('help'.yellow + ' - Shows this help text.');
    console.info('quit'.yellow + ' - Quits donaldtrump.js.');
    done();
}

function quit() {
    console.info('Bye bye');
    process.exit();
}

function makePrompt() {
    BUSY = false;
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdout.write('trump$ ');
}
