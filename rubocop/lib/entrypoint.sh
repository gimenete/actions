#!/bin/sh

set -e

apk add --update ruby-dev build-base
gem install rubocop

node /action/lib/run.js
