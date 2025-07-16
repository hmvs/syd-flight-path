#!/bin/bash
zip -r extension.zip . -x "*.DS_Store*" "*/.*" ".git*" ".idea/*" ".junie/*" "utils/*" "build.sh"