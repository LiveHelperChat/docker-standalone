FROM remdex/livehelperchat-php:latest

ENV DEBIAN_FRONTEND noninteractive
ENV TAG 4.76v

ADD lhc/cron /etc/cron.d/lhc

RUN chmod 0644 /etc/cron.d/lhc

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run the command on container startup

RUN apt update \
 && apt -qy install cron && \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

CMD ["cron", "-f"]
