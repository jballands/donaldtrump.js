//
//  index.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import colors from 'colors';
import Authenticator from './Authenticator';
import Digester from './Digester';
import env from './utils/env';
import cmd from './utils/cmd';

// -----------------------------------------------------------------------------

const a = new Authenticator();

new Digester(a)
    .connectToDB()
    .then(d => {
        // If running interactively, start the interactive helper
        if (env.isProd === false) {
            cmd(d);
        } else {
            // Otherwise, we're working non-interactively and we need to get our Trump on
            d.beginPolling();
        }
    })
    .catch(err => {
        console.error(err.message.red);
    });
