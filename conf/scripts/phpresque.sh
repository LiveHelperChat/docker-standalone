#!/bin/sh
# live site cronjobs

# Cron jobs do not inherit docker env vars, so read worker count from mounted env file.
workers_count=''
if [ -f /scripts/.env ]; then
	workers_count=$(sed -n 's/^LHC_RESQUE_WORKERS_COUNT=//p' /scripts/.env | head -n 1)
fi

queue_name=''
if [ -f /scripts/.env ]; then
	queue_name=$(sed -n 's/^LHC_RESQUE_QUEUE=//p' /scripts/.env | head -n 1)
fi

case "$workers_count" in
	''|*[!0-9]*) workers_count=2 ;;
esac

if [ -z "$queue_name" ]; then
	queue_name='*'
fi

echo "Running live site cronjobs"
ulimit -n 65535
cd /code
REDIS_BACKEND=redis:6379 REDIS_BACKEND_DB=1 INTERVAL=1 COUNT="$workers_count" VERBOSE=0 QUEUE="$queue_name" /usr/local/bin/php resque.php 2>&1
