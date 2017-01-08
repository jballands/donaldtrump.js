//
//  utils/env.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

const env = {
    isProd: process.env.NODE_ENV === 'production',
    twitter: {
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET,
        callback: process.env.CALLBACK
    },
    mLabUri: process.env.MONGODB_URI
};

export default env;
