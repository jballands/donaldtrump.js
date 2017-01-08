# donaldtrump.js

The tremendous Markov chain bot that tweets about the web.

## Installation

```
# Yarn is cool
$ brew update && brew install yarn

# You'll need a MongoDB local instance
$ brew install mongodb

# Install dependencies
$ yarn

# Make a database directory locally
$ mkdir -p ./data/db

# Start the Mongo daemon pointing at that directory
$ mongod --dbpath ./data/db

# Start in development mode
$ yarn run dev
```

Output should appear on your console.
