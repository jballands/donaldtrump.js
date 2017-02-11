//
//  utils/cmd.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import process from 'process';
import util from 'util';

// -----------------------------------------------------------------------------

export default function(digester) {
    console.info('INFO: donaldtrump.js is working interactively'.cyan);

    makePrompt();

    process.stdin.on('data', i => {
        process.stdin.pause();

        switch (i) {
            case 'fetch\n':
                digester.fetchTweets(makePrompt); break;
            case 'quit\n':
                quit(makePrompt); break;
            default:
                help(makePrompt);
        }
    });
}

function help(done) {
    console.info('You can say:'.cyan);
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
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdout.write('trump$ ');
}
