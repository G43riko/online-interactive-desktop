#!/bin/bash

fileName="minVersion.js";

echo "" > $fileName;
cat js/objects/*.js >> $fileName;
cat js/components/*.js >> $fileName;
cat js/utils/*.js >> $fileName;
cat js/canvas.js >> $fileName;
cat js/config.js >> $fileName;
cat js/listeners.js >> $fileName;
cat js/main.js >> $fileName;

