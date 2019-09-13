#!/bin/bash
set -e

if [ -z "$1" ]

then
    echo "No arguments supplied. At least 1 argument is needed"
    
    exit
fi


pathFile=$1
parameter1=$2
parameter2=$3
parameter3=$4
parameter4=$5

exec node $pathFile $parameter1 $parameter2 $parameter3 $parameter4