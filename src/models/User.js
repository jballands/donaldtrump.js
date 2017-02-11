//
//  schema/User.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

import Mongoose from 'mongoose';

// -----------------------------------------------------------------------------

export default Mongoose.model('User', new Mongoose.Schema({
    token: { type: String, required: true },
    tokenSecret: { type: String, required: true },
    id: { type: String, required: true }
}));
