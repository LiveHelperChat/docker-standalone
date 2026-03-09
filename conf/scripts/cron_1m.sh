#!/bin/sh
fileCron='/code/running-1m'

if [ ! -f $fileCron ];
then
  touch $fileCron;
  # Add your cronjobs to run every minute here
  cd /code && echo "test 1m" > cache/cron_1m.log
  echo "$(tail -1000 cache/cron_1m.log)" > cache/cron_1m.log
  rm -f $fileCron;
else
  if [ `stat --format=%Y $fileCron` -le $(( `date +%s` - 90 )) ]; then
    rm -f $fileCron;
  fi
  echo "Already running"
fi