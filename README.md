## Instructions

This is dockerized version of Live Helper Chat. It includes these images

* `web` - nginx service
* `php` - php-fpm service
* `cobrowse` - cobrowsing running NodeJS service
* `php-cronjob` - cronjobs running service
* `php-resque` - php-resque worker running service
* `nodejshelper` - NodeJS Helper NodeJS running service
* `redis` - Redis service
* `db` - Database service

## Docker instructions

* Checkout the repository
* Run `cd docker-standalone`
* Copy `.env.default` to `.env`
* Edit `.env` file and change `LHC_SECRET_HASH` to any random string
* Database default settings if you don't change those in `.env` file.
  * Host - `db` 
  * Database name - `lhc`
  * Database username - `lhc`
  * Database password - `lhc`
* For standard version without NodeJS plugin run
     * Run `install.sh` this will checkout Live Helper Chat and required extensions
     * Run `docker compose -f docker-compose-standard.yml build --no-cache` to build from scratch. You might need it you are running on `linux/arm64` as I only provide `linux/amd64` architecture
     * Run `docker compose -f docker-compose-standard.yml pull && docker-compose -f docker-compose-standard.yml up`
* For version with NodeJS plugin
     * Run `install-nodejs.sh` this will checkout Live Helper Chat and required extensions
     * Run `docker compose -f docker-compose-nodejs.yml build --no-cache` to build from scratch. You might need it you are running on `linux/arm64` as I only provide `linux/amd64` architecture
     * Run `docker compose -f docker-compose-nodejs.yml pull && docker-compose -f docker-compose-nodejs.yml up` to use already existingimages
* You will need to install composer dependencies
```shell
docker exec -it docker-standalone-php-1 /bin/bash
cd /code/
# Commands from https://getcomposer.org/download/
php composer.phar install
```
* 
* Navigate to localhost:8081 and follow install instructions.
* If you want to run docker as a service append `-d` to docker commands. `docker-compose -f docker-compose-nodejs.yml up -d`

At first install steps you might need to run these commands to change folders permissions.

```shell
docker exec -it docker-standalone-web-1 chown -R www-data:www-data /code/cache
docker exec -it docker-standalone-web-1 chown -R www-data:www-data /code/settings
docker exec -it docker-standalone-web-1 chown -R www-data:www-data /code/var
```

or change permission of these folders

```
livehelperchat/lhc_web/cache
livehelperchat/lhc_web/settings
livehelperchat/lhc_web/var
```
## How to listen on standard 80 port?

Edit `.env` file and set `LHC_PUBLIC_PORT` and `LHC_NODE_JS_PORT` port to `80`

## How to setup HTTPS?

That's up to you. You can have in host machine runing nginx and just proxy request or tweak images/docker files I provided. You should play around with `web` service.

## My mails are not sending?

You have to edit back office mail settings and use SMTP.

## How to update?

```shell
# Update docker images
cd docker-standalone && git pull origin master
# If there is any changes you can build your containers
docker compose -f docker-compose-nodejs.yml build --no-cache

# I would recommend also just restart composer containers
docker compose -f docker-compose-nodejs.yml down
docker compose -f docker-compose-nodejs.yml up

# All these commands are executed from docker-standalone folder
cd livehelperchat && git pull origin mail-merge-ms-svelte
cd lhc-php-resque && git pull origin master-svelte
cd NodeJS-Helper && git pull origin master

# Login to php-fpm container and execute
docker exec -it docker-standalone-php-1 /bin/bash
# Execute in cotnainer
cd /code && php cron.php -s site_admin -c cron/util/update_database -p local
cd /code && php cron.php -s site_admin -c cron/util/clear_cache

```

## After install todo

* Go to `Settings -> Live help confgiuration -> Chat configuration -> Screen sharing` and
    * Check `NodeJs support enabled`
    * In `socket.io path, optional` enter `/wsnodejs/socket.io`
* Go to `Settings -> Live help confgiuration -> Chat configuration -> Online tracking` and
    * Check `Cleanup should be done only using cronjob.`
    * Check `Footprint updates should be processed in the background. Make sure you are running workflow background cronjob.`
 * Go to `Settings -> Live help confgiuration -> Chat configuration -> Misc` and
   * Check `Disable live auto assign`
 * Go to `Settings -> Live help confgiuration -> Chat configuration -> Workflow` and
    * Check `Should cronjob run departments transfer workflow, even if user leaves a chat`