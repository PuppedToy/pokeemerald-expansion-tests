#!/bin/bash
# Wrapper — forwards all arguments to make.js.
# Usage: ./randomize_and_make.sh [--bundle=path.json] [--randomize] [--debug] [--clean] [...]
exec node "$(dirname "$0")/make.js" "$@"
