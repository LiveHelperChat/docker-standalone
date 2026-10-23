############################
# Stage 1: Build
############################
FROM php:8.5-fpm AS builder

ARG DEBIAN_FRONTEND=noninteractive
  apt -qy install git unzip cron zlib1g-dev curl procps libzip-dev libonig-dev libpng-dev libwebp-dev libjpeg62-turbo-dev libxpm-dev libfreetype6-dev libkrb5-dev libldap2-dev imagemagick libmagickwand-dev libheif-dev && \
    docker-php-ext-install sockets bcmath pcntl zip mbstring mysqli pdo pdo_mysql ldap && \

# Build dependencies + Sury repo (needed for libc-client-dev)
RUN apt-get update && apt-get install -y --no-install-recommends \
        wget gnupg lsb-release ca-certificates curl \
        zlib1g-dev libzip-dev libonig-dev libpng-dev libwebp-dev \
        libjpeg62-turbo-dev libxpm-dev libfreetype6-dev \
        libkrb5-dev libldap2-dev libssl-dev \
        libmagickwand-dev libheif-dev unixodbc-dev \
 && wget -qO - https://packages.sury.org/php/README.txt | bash \
 && apt-get update \
 && apt-get install -y --no-install-recommends libc-client-dev \
 && rm -rf /var/lib/apt/lists/*

# Core extensions
RUN docker-php-ext-configure gd --with-webp --with-jpeg --with-xpm --with-freetype \
 && docker-php-ext-install -j"$(nproc)" gd sockets bcmath pcntl zip mbstring mysqli pdo pdo_mysql ldap

# PECL extensions (imap separately so the -D options only apply to it)
RUN pecl channel-update pecl.php.net \
 && pecl install sqlsrv pdo_sqlsrv imagick redis \
 && pecl install -D 'with-kerberos="yes" with-imap-ssl="yes"' imap \
 && docker-php-ext-enable sqlsrv pdo_sqlsrv imagick redis imap

# Work out which runtime packages the compiled extensions need
RUN set -eux; \
    find /usr/local/lib/php/extensions -name '*.so' -exec ldd {} + \
      | awk '/=>/ {print $3}' | sort -u \
      | xargs -r readlink -f \
      | xargs -r dpkg-query -S 2>/dev/null \
      | cut -d: -f1 | sort -u > /tmp/runtime-deps.txt; \
    cat /tmp/runtime-deps.txt

############################
# Stage 2: Runtime
############################
FROM php:8.5-fpm AS runtime

ARG DEBIAN_FRONTEND=noninteractive
ENV TAG=4.76v

# Sury repo (for libc-client2007e) + Microsoft repo (for msodbcsql18 / mssql-tools18)
RUN apt-get update && apt-get install -y --no-install-recommends wget gnupg lsb-release ca-certificates curl \
 && wget -qO - https://packages.sury.org/php/README.txt | bash \
 && curl -fsSL https://packages.microsoft.com/keys/microsoft-rolling.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
 && curl -fsSL https://packages.microsoft.com/config/debian/13/prod.list -o /etc/apt/sources.list.d/mssql-release.list \
 && rm -rf /var/lib/apt/lists/*

# Runtime libs for the compiled extensions (list generated in the builder stage)
COPY --from=builder /tmp/runtime-deps.txt /tmp/runtime-deps.txt

# Runtime packages: extension libs, MS ODBC driver + tools, and the tools from the original image
RUN apt-get update \
 && ACCEPT_EULA=Y apt-get install -y --no-install-recommends \
        $(cat /tmp/runtime-deps.txt) \
        msodbcsql18 mssql-tools18 \
        git unzip procps imagemagick \
 && apt-get purge -y --auto-remove gnupg lsb-release wget \
 && rm -rf /var/lib/apt/lists/* /tmp/runtime-deps.txt

# Copy compiled extensions + their ini files from the builder
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

RUN mkdir /code && chown www-data:www-data /code
