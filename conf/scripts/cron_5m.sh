#!/bin/sh
fileCron='/code/running-5m'

if [ ! -f $fileCron ];
then
  touch $fileCron;
  # Add your cronjobs to run every 5 minutes here
  echo "$(tail -1000 cache/cron_5m.log)" > cache/cron_5m.log
  rm -f $fileCron;
else
  if [ `stat --format=%Y $fileCron` -le $(( `date +%s` - 90 )) ]; then
    rm -f $fileCron;
  fi
  echo "Already running"
fi