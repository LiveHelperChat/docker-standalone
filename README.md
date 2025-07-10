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
* Edit `docker-standalone/lhc-php-resque/lhcphpresque/settings/settings.ini.php` and put proper `site_address` domain value. php-resque does not know what domain it's running
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

E.g to the ones who are too lazy too use google :D
* https://macdonaldchika.medium.com/how-to-install-tls-ssl-on-docker-nginx-container-with-lets-encrypt-5bd3bad1fd48

### Tip commands 

Generate SSL certificate under docker folder for `demo.livehelperchat.com` domain. Change paths in this command. You have to be pointed domain to your sever

```
certbot certonly --config-dir /opt/lhc/docker-standalone/conf/nginx/ssl --webroot --webroot-path /opt/lhc/docker-standalone/livehelperchat/lhc_web -d demo.livehelperchat.com
```

This is how cronjob can look like. Make sure you put your domain and correct `docker-standalone-web-1` name.

```
0 0 * * * certbot certonly --keep-until-expiring --config-dir /opt/lhc/docker-standalone/conf/nginx/ssl --webroot --webroot-path /opt/lhc/docker-standalone/livehelperchat/lhc_web -d demo.livehelperchat.com --post-hook "docker restart docker-standalone-web-1" > /dev/null 2>&1
```

If you are migrating server and want to setup fresh certbot, you can just use this command

```
certbot certonly --manual --preferred-challenges http --config-dir /opt/lhc/docker-standalone/conf/nginx/ssl -d demo.livehelperchat.com
```

`web` service part will have to look like
```yaml
  web:
    image: nginx:latest
    env_file: .env
    ports:
      - "${LHC_PUBLIC_PORT}:80"
      - "443:443"
    volumes:
      - ./livehelperchat/lhc_web:/code
      - ./conf/nginx/site-ssl.conf:/etc/nginx/conf.d/default.conf
      - ./conf/nginx/mime.types:/etc/nginx/mime.types
      - ./conf/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./conf/nginx/ssl/live/demo.livehelperchat.com/fullchain.pem:/etc/nginx/ssl/demo.livehelperchat.com/fullchain.pem
      - ./conf/nginx/ssl/live/demo.livehelperchat.com/privkey.pem:/etc/nginx/ssl/demo.livehelperchat.com/privkey.pem
    depends_on:
      - db
      - php
      - php-cronjob
    networks:
      - code-network
    restart: always
```

Modify `/conf/nginx/site-ssl.conf` and change where you see `demo.livehelperchat.com` to your domain.

Rebuild docker image after a changes.

```
cd /opt/lhc/docker-standalone && docker compose -f docker-compose-nodejs.yml build --no-cache
```

Remember to automated SSL issuing workflow :)

```
cd /opt/lhc/docker-standalone && docker compose -f docker-compose-nodejs.yml down
cd /opt/lhc/docker-standalone && docker compose -f docker-compose-nodejs.yml up -d
```

## My mails are not sending?

You have to edit back office mail settings and use SMTP.

## How to update?

```shell
# Update docker images
cd docker-standalone && git pull origin master
# If there is any changes you can build your containers
docker compose -f docker-compose-nodejs.yml build --no-cache

# Or just pull new ones
docker-compose -f docker-compose-nodejs.yml pull

# I would recommend also just restart composer containers
docker compose -f docker-compose-nodejs.yml down
docker compose -f docker-compose-nodejs.yml up
# OR start docker as service
docker compose -f docker-compose-nodejs.yml up -d

# All these commands are executed from docker-standalone folder
cd livehelperchat && git pull origin master
cd lhc-php-resque && git pull origin master
cd NodeJS-Helper && git pull origin master

# Login to php-fpm container and execute
docker exec -it docker-standalone-php-1 /bin/bash
# Execute in container
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
 * Set `'site_address' => 'https://chat.example.com'` in `settings/settings.ini.php` to your install installation path. It has to be location where `index.php` is located.
 * Set `site_address` in `docker-standalone/lhc-php-resque/lhcphpresque/settings/settings.ini.php`
 * After install make sure `settings/settings.ini.php` file looks like this if you are using `php-resque` and `nodejs`
 * ```'extensions' =>
   array (
   0 => 'lhcphpresque',
   1 => 'nodejshelper',
   ),```

## How to run everything under proxy with HTTPS support?

```apacheconf
server {
    listen         *:80; # This line should be gone once SSL is setup
    server_name    server_name chat.example.com; # Change to your domain

    location / {
	      proxy_set_header X-Real-IP $remote_addr;
	      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	      proxy_set_header Host $http_host;
	      proxy_set_header X-NginX-Proxy true;
	      # Uncomment below two lines if you are running under https. So LHC will pickup https correctly
	      # proxy_set_header X-Forwarded-Proto https;
	      # proxy_set_header X-Forwarded-Ssl on;

	      proxy_pass http://localhost:8081/; # Change port to your docker public port
	      proxy_redirect off;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
    }
    
    # Those will appear automaticlaly once you setup SSL using certbot
    # listen 443 ssl; # managed by Certbot
    # ssl_certificate /etc/letsencrypt/live/chat.example.com/fullchain.pem; # managed by Certbot
    # ssl_certificate_key /etc/letsencrypt/live/chat.example.com/privkey.pem; # managed by Certbot
    # include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

* (Required) Set to true so IP will be detected correctly under proxy - https://github.com/LiveHelperChat/livehelperchat/blob/3e5d1249faddb15273e6897492edcd3798074b36/lhc_web/settings/settings.ini.default.php#L20
* (Optional) In `System configuration > Live help configuration -> Chat configuration -> Misc` under `Please enter explicit http mode. Either http: or https:, do not forget : at the end.` enter `https:` it will force always to use HTTPS once setup.