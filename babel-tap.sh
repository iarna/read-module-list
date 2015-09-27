PATH="$PATH:node_modules/.bin"
(for a in "$@"; do babel-node "$a"; done) | tap -
