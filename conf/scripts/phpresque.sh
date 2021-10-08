#!/bin/sh
# live site cronjobs

echo "Running live site cronjobs"
cd /code
INTERVAL=1 COUNT=2 VERBOSE=0 QUEUE='*' /usr/local/bin/php resque.php 2>&1
