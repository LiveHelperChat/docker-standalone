FROM remdex/livehelperchat-php:latest

ARG DEBIAN_FRONTEND=noninteractive

# Resque workers are supervised by cron (resque.sh starts/keeps them alive,
# the 07:40 job recreates the lock file so workers get restarted daily)
ADD lhc/cron /etc/cron.d/lhc

# cron requires the job file to be owned by root and not group/world writable
RUN set -eux; \
    chown root:root /etc/cron.d/lhc; \
    chmod 0644 /etc/cron.d/lhc; \
    touch /var/log/cron.log; \
    apt-get update; \
    apt-get install -y --no-install-recommends cron; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

CMD ["cron", "-f"]
