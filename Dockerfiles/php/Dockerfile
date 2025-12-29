FROM php:8.5-fpm

ENV DEBIAN_FRONTEND noninteractive
ENV TAG 4.76v

RUN apt-cache search bcmath

# Run the command on container startup

RUN apt update && \
    apt -qy install git unzip zlib1g-dev curl procps libzip-dev libonig-dev libpng-dev libwebp-dev libjpeg62-turbo-dev libxpm-dev libfreetype6-dev libkrb5-dev libldap2-dev imagemagick libmagickwand-dev libheif-dev && \
    docker-php-ext-install sockets bcmath pcntl zip mbstring mysqli pdo pdo_mysql ldap && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN apt update && \
    apt -qy install wget gnupg lsb-release ca-certificates && \
    wget -qO - https://packages.sury.org/php/README.txt | bash -x && \
    apt update && \
    apt -qy install libc-client-dev && \
    pecl channel-update pecl.php.net && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pecl install imap && docker-php-ext-enable imap
RUN pecl install imagick && docker-php-ext-enable imagick

RUN docker-php-ext-configure gd --with-webp --with-jpeg --with-xpm --with-freetype

RUN docker-php-ext-install gd

RUN pecl install redis && docker-php-ext-enable redis

RUN mkdir /code

RUN chown www-data:www-data /code
