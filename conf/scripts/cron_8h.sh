#!/bin/sh
fileCron='/code/running-8h'

if [ ! -f $fileCron ];
then
  touch $fileCron;
  # Add your cronjobs to run every 8 hours here
  cd /code && echo "test 8h" > cache/cron_8h.log
  echo "$(tail -1000 /code/cache/cron_8h.log)" > /code/cache/cron_8h.log
  rm -f $fileCron;
else
  if [ `stat --format=%Y $fileCron` -le $(( `date +%s` - 600 )) ]; then
    rm -f $fileCron;
  fi
  echo "Already running"
fi