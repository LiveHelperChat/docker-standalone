#!/bin/sh
fileCron='/code/running-7h_7m_daily'

if [ ! -f $fileCron ];
then
  touch $fileCron;
  # Add your cronjobs to run once a day at 07:07 here
  cd /code && echo "test cron_7h_7m_daily" > cache/cron_7h_7m_daily.log
  echo "$(tail -1000 cache/cron_7h_7m_daily.log)" > cache/cron_7h_7m_daily.log
  rm -f $fileCron;
else
  if [ `stat --format=%Y $fileCron` -le $(( `date +%s` - 600 )) ]; then
    rm -f $fileCron;
  fi
  echo "Already running"
fi