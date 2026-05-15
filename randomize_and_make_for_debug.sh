#!/bin/bash -ex

# Run the randomizer
node ./randomizer/index.js --debug

# If $1 = clean, clean the build
if [ "$1" == "clean" ]; then
    make clean
fi

# Make
make -j

# Reset git
git reset --hard

exit 0