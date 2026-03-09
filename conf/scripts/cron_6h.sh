#!/bin/sh
fileCron='/code/running-6h'

if [ ! -f $fileCron ];
then
  touch $fileCron;
  # Add your cronjobs to run every 6 hours here
  cd /code && echo "test 6h" > cache/cron_6h.log
  echo "$(tail -1000 cache/cron_6h.log)" > cache/cron_6h.log
  rm -f $fileCron;
else
  if [ `stat --format=%Y $fileCron` -le $(( `date +%s` - 600 )) ]; then
    rm -f $fileCron;
  fi
  echo "Already running"
fi