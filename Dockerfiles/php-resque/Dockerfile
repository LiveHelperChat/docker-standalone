FROM php:fpm

ENV DEBIAN_FRONTEND noninteractive
ENV TAG 3.43v

RUN apt-cache search bcmath

ADD lhc/cron /etc/cron.d/lhc

RUN chmod 0644 /etc/cron.d/lhc

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run the command on container startup

RUN apt update && \
    apt -qy install git unzip cron procps zlib1g-dev curl libzip-dev libonig-dev libpng-dev libwebp-dev libjpeg62-turbo-dev libxpm-dev libfreetype6-dev && \
    docker-php-ext-install sockets bcmath pcntl zip mbstring mysqli pdo pdo_mysql && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-webp --with-jpeg --with-xpm --with-freetype

RUN docker-php-ext-install gd

RUN pecl install redis && docker-php-ext-enable redis

CMD ["cron", "-f"]