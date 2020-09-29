FROM php:fpm

ENV DEBIAN_FRONTEND noninteractive
ENV TAG 3.43v

RUN apt-cache search bcmath

# Run the command on container startup

RUN apt update && \
    apt -qy install git unzip zlib1g-dev curl procps libzip-dev libonig-dev libpng-dev libwebp-dev libjpeg62-turbo-dev libxpm-dev libfreetype6-dev && \
    docker-php-ext-install sockets bcmath pcntl zip mbstring mysqli pdo pdo_mysql && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-webp --with-jpeg --with-xpm --with-freetype

RUN docker-php-ext-install gd

RUN pecl install redis && docker-php-ext-enable redis

RUN mkdir /code

RUN chown www-data:www-data /code
