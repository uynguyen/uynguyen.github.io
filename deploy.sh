#!/usr/bin/env bash
#
# deploy.sh — Build the Hexo site and publish it to the GitHub Pages repo.
#
# Flow:
#   1. Select Node 12 (Hexo 4.x is incompatible with newer Node versions).
#   2. Commit & push the source changes to this repo.
#   3. Clean + build the static site into ./public.
#   4. Copy the build output into the sibling Pages repo and force-push it.
#
# Usage: ./deploy.sh ["optional commit message"]

set -euo pipefail

# --- Config -----------------------------------------------------------------
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${SOURCE_DIR}/../uynguyen.github.io"   # GitHub Pages repo (sibling dir)
NODE_VERSION="12"
COMMIT_MSG="${1:-Update site}"                      # pass a message as the 1st arg

# --- Helpers ----------------------------------------------------------------
log()  { printf '\n\033[1;32m[deploy %s] %s\033[0m\n' "$(date +%H:%M:%S)" "$*"; }
fail() { printf '\n\033[1;31m[deploy %s] ERROR: %s\033[0m\n' "$(date +%H:%M:%S)" "$*" >&2; exit 1; }

# Commit only if there is something staged (avoids `set -e` aborting on no-op).
commit_if_changed() {
    git add -A
    if git diff --cached --quiet; then
        log "No changes to commit in $(basename "$PWD")."
    else
        git commit -m "$1"
    fi
}

# --- 1. Select Node version -------------------------------------------------
log "Selecting Node ${NODE_VERSION} via nvm..."
# nvm is a shell function, so source it if it isn't already loaded.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
command -v nvm >/dev/null 2>&1 || fail "nvm not found; cannot select Node ${NODE_VERSION}."
nvm alias default "$NODE_VERSION"   # make Node 12 the default for nvm
nvm use "$NODE_VERSION"
log "Using $(node -v)"

# --- 2. Commit & push the source ------------------------------------------
# NOTE: origin/master is the *published* site (built HTML, force-pushed in
# step 4 from the deploy repo). The source code lives on its own branch, so we
# push the currently checked-out branch here — never master.
cd "$SOURCE_DIR"
SOURCE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$SOURCE_BRANCH" = "master" ] && fail "Refusing to push source onto 'master' (that branch is the published site)."
log "Committing source changes on '${SOURCE_BRANCH}'..."
commit_if_changed "$COMMIT_MSG"
log "Pushing source to origin/${SOURCE_BRANCH}..."
git push -u origin "$SOURCE_BRANCH"

# --- 3. Build the static site ---------------------------------------------
log "Cleaning previous build..."
hexo clean
log "Generating site into ./public..."
hexo generate

# Sanity check: a successful build must produce a non-empty index.html.
[ -s "public/index.html" ] || fail "Build output looks empty (public/index.html missing or 0 bytes)."
log "Build OK ($(find public -type f | wc -l | tr -d ' ') files generated)."

# --- 4. Publish to the GitHub Pages repo ----------------------------------
[ -d "$DEPLOY_DIR/.git" ] || fail "Deploy repo not found at ${DEPLOY_DIR}."
log "Copying build output to ${DEPLOY_DIR}..."
cp -Rf ./public/* "$DEPLOY_DIR/"

cd "$DEPLOY_DIR"
log "Committing & force-pushing the published site..."
commit_if_changed "deploy"
git push -u origin master --force

log "Done. Site deployed. 🚀"
