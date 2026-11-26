#!/bin/sh
fileCron='/code/running-5m'

if [ ! -f $fileCron ];
then
  touch $fileCron;
  # Add your cronjobs to run every 5 minutes here
  cd /code && echo "test 5m" > cache/cron_5m.log
  echo "$(tail -1000 /code/cache/cron_5m.log)" > /code/cache/cron_5m.log
  rm -f $fileCron;
else
  if [ `stat --format=%Y $fileCron` -le $(( `date +%s` - 90 )) ]; then
    rm -f $fileCron;
  fi
  echo "Already running"
fi