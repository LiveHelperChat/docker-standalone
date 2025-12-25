FROM php:8.3-fpm-bullseye

ENV DEBIAN_FRONTEND=noninteractive
ENV TAG=4.5v

ADD lhc/cron /etc/cron.d/lhc
RUN chmod 0644 /etc/cron.d/lhc

RUN touch /var/log/cron.log

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip cron procps zlib1g-dev curl libzip-dev libonig-dev \
    libpng-dev libwebp-dev libjpeg62-turbo-dev libxpm-dev libfreetype6-dev \
    libc-client-dev libkrb5-dev libldap2-dev imagemagick libmagickwand-dev libheif-dev \
    && docker-php-ext-install sockets bcmath pcntl zip mbstring mysqli pdo pdo_mysql opcache ldap \
    && docker-php-ext-configure gd --with-webp --with-jpeg --with-xpm --with-freetype \
    && docker-php-ext-install gd \
    && pecl install imap imagick redis \
    && docker-php-ext-enable imap imagick redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/pear

RUN mkdir /code && chown www-data:www-data /code
WORKDIR /code

CMD ["cron", "-f"]
