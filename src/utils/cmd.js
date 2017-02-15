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

export default function(digester, tweeter) {
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
                digester.fetchTweets()
                    .then(() => makePrompt())
                    .catch(err => console.error(err.red));;
                break;
            case 'sample':
                tweeter.getTweet()
                    .then(tweet => {
                        console.info(`> ${tweet}`.cyan);
                        makePrompt();
                    })
                    .catch(err => console.error(err.red));
                break;
            case 'post':

            case 'quit':
                quit(makePrompt); break;
            default:
                help(makePrompt);
        }
    });
}

function help(done) {
    console.info('fetch'.yellow + ' - Fetches new tweets from @realDonaldTrump.');
    console.info('sample'.yellow + ' - Generates a tweet sample without posting to Twitter.');
    console.info('post'.yellow + ' - Generates a tweet and posts it to Twitter.');
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
