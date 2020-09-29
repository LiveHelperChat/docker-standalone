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
* Database settings
  * Host - `db` 
  * Database name - `lhc`
  * Database username - `lhc`
  * Database password - `lhc`
* Edit `docker-compose.yml` if you want to change database logins
* Run `install.sh` this will checkout Live Helper Chat and required extensions
* Run `docker-compose up`
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

### Version with `nodejshelper` plugin

Pending...

That's it! You have running Live Helper Chat