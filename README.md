## Instructions

This is dockerized version of Live Helper Chat. It includes these images

* Nginx running image
* php-fpm running image
* Live Helper Chat cronjob running image
* php-resque running image
* Redis running image
* Database running image
* NodeJS running image (version with NodeJS)

### Default versions

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
     * Run `docker-compose -f docker-compose-standard.yml up`
* For version with NodeJS plugin
     * Run `install-nodejs.sh` this will checkout Live Helper Chat and required extensions
     * Run `docker-compose -f docker-compose-nodejs.yml up`

* Navigate to localhost:8081 and follow install instructions.

At first install steps you might need to run these commands to change folders permissions.

```shell script
docker exec -it docker-standalone_web_1 chown -R www-data:www-data /code/cache
docker exec -it docker-standalone_web_1 chown -R www-data:www-data /code/settings
docker exec -it docker-standalone_web_1 chown -R www-data:www-data /code/var
```

or change permission of these folders

```
livehelperchat/lhc_web/cache
livehelperchat/lhc_web/settings
livehelperchat/lhc_web/var
```