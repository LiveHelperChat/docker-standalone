#!/bin/sh
fileCron='/code/running-30m'

if [ ! -f $fileCron ];
then
  touch $fileCron;
  # Add your cronjobs to run every 30 minutes here
  cd /code && echo "test 30m" > cache/cron_30m.log
  echo "$(tail -1000 cache/cron_30m.log)" > cache/cron_30m.log
  rm -f $fileCron;
else
  if [ `stat --format=%Y $fileCron` -le $(( `date +%s` - 600 )) ]; then
    rm -f $fileCron;
  fi
  echo "Already running"
fi