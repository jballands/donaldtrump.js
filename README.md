# donaldtrump.js

The tremendous Markov chain bot that tweets about the web.

## Installation

donaldtrump.js needs some infrastructure to run, so bear with me.

You'll need to set up environment variables containing your `consumerKey` and
`consumerSecret`. To do so, you'll first need to [create an app with Twitter](https://apps.twitter.com/),
then:

```
$ export CONSUMER_KEY=<your_app_key>
$ export CONSUMER_SECRET=<your_app_secret>
```

Once you've done this, you'll need a local MongoDB instance running
(unless you have a Mongo URI that you would like to associate
with the environment variable `MONGODB_URI`):

```
# Get Mongo if you don't already have it
$ brew update && brew install mongodb

# Make a database directory locally
$ mkdir -p ./data/db

# Start the Mongo daemon pointing at that directory
$ mongod --dbpath ./data/db
```

Finally, you can run the app:

```
# Yarn is cool
$ brew install yarn

# Install dependencies
$ yarn

# Start in development mode
$ yarn dev
```

Output should appear on your console. At this time, the app should run
interactively. *Production execution has not yet been implemented and
setting `NODE_ENV=production` will yield unexpected behavior.*
