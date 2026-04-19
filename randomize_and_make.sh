#!/bin/bash -ex

# Run the randomizer
node ./puppedjs/index.js

# Touch teachable_learnsets.h to ensure its timestamp is newer than ALL Makefile deps
# (including all_learnables.json which make builds on-demand, and tms_hms.h).
# Without this, make_teachables.py can be triggered and overwrite the expanded teachables.
touch src/data/pokemon/teachable_learnsets.h

# If $1 = clean, clean the build
if [ "$1" == "clean" ]; then
    make clean
fi

# Make
make -j

# Reset git
git reset --hard

exit 0