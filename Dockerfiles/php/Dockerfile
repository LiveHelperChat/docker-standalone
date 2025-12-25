FROM php:8.3-fpm-bullseye

ENV DEBIAN_FRONTEND=noninteractive
ENV TAG=4.6v

RUN apt-get update && apt-get install -y \
    git unzip zlib1g-dev libzip-dev libonig-dev \
    libpng-dev libwebp-dev libjpeg62-turbo-dev libxpm-dev libfreetype6-dev \
    libkrb5-dev libssl-dev libc-client-dev libldap2-dev libmagickwand-dev imagemagick \
    && docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-install imap sockets bcmath pcntl zip mbstring mysqli pdo pdo_mysql opcache ldap gd \
    && pecl install redis imagick \
    && docker-php-ext-enable redis imagick \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-webp --with-jpeg --with-xpm --with-freetype

RUN mkdir /code && chown www-data:www-data /code
WORKDIR /code
