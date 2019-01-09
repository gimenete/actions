#!/bin/sh

npm install
NODE_PATH=node_modules node /action/lib/create-check.js
