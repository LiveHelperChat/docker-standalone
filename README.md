## Instructions

### Default versions

* Checkout the repository
* Run `cd docker-standalone`
* Database host will be `db` and database name, username, password will be `lhc`
* Edit `docker-compose.yml` if you want to change database logins
* Run `install.sh` this will checkout Live Helper Chat and required extensions
* Run `docker-compose up`
* Navigate to localhost:8081 and follow install instructions.

At first install steps you might need to run these commands to change folders permissions.

```shell script
docker exec -it dockerised-php_web_1 chown -R www-data:www-data /code/cache
docker exec -it dockerised-php_web_1 chown -R www-data:www-data /code/var
docker exec -it dockerised-php_web_1 chown -R www-data:www-data /code/settings
```

### Version with `nodejshelper` plugin

Pending...

That's it! You have running Live Helper Chat