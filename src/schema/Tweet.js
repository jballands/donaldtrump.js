//
//  schema/Tweet.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import mongoose from 'mongoose';

// -----------------------------------------------------------------------------

export default mongoose.model('Tweet', new mongoose.Schema({
    value: { type: String, required: true },
    date: { type: Date, required: true }
}));
