#!/bin/bash
# $1 is env
# $2 is install or en-US,en-UK

exp="./languages/*"
langs=$exp

if [ "$2" = "install" ]; then
  yarn
elif [ "$2" = "disable" ]; then
  langs=""
elif [ "$2" ]; then
  langs=$2
  IFS=,
fi

if [ "$langs" ]; then
  for file in $langs; do
    lang=`basename $file .json`
    if [ "$file" = "$exp" ]; then
      lang=""
    fi
    NODE_ENV=$1 LOCALE=$lang yarn run build
  done
else
  NODE_ENV=$1 yarn run build
fi
