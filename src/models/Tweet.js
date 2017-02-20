//
//  models/Tweet.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import Mongoose from 'mongoose';

Mongoose.Promise = global.Promise;

// -----------------------------------------------------------------------------

export default Mongoose.model('Tweet', new Mongoose.Schema({
    value: { type: String, required: true },
    date: { type: Date, required: true },
    handle: { type: String, required: true },
    id: { type: Number, required: true }
}));
