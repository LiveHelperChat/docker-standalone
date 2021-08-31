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
     * Run `docker-compose -f docker-compose-standard.yml pull && docker-compose -f docker-compose-standard.yml up`
* For version with NodeJS plugin
     * Run `install-nodejs.sh` this will checkout Live Helper Chat and required extensions
     * Run `docker-compose -f docker-compose-nodejs.yml pull && docker-compose -f docker-compose-nodejs.yml up`

* Navigate to localhost:8081 and follow install instructions.

At first install steps you might need to run these commands to change folders permissions.

```shell script
docker exec -it dockerstandalone_web_1 chown -R www-data:www-data /code/cache
docker exec -it dockerstandalone_web_1 chown -R www-data:www-data /code/settings
docker exec -it dockerstandalone_web_1 chown -R www-data:www-data /code/var
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

## After install todo

* Go to `Settings -> Live help confgiuration -> Chat configuration -> (Screen sharing)` and
    * Check `NodeJs support enabled`
    * In `socket.io path, optional` enter `/wsnodejs/socket.io`
