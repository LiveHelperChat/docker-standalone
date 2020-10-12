#!/bin/sh

echo "Cloning Live Helper Chat repository"
git clone https://github.com/LiveHelperChat/livehelperchat.git

echo "Cloning php-resque repository"
git clone https://github.com/LiveHelperChat/lhc-php-resque.git

echo "Copying resque file to lhc_web"
cp lhc-php-resque/lhcphpresque/doc/resque.php livehelperchat/lhc_web

echo "Copying default lhcphpresque settings file"
cp lhc-php-resque/lhcphpresque/settings/settings.ini.default.php lhc-php-resque/lhcphpresque/settings/settings.ini.php

echo "Changing host to redis"
sed -i "s+'localhost'+'redis'+g" lhc-php-resque/lhcphpresque/settings/settings.ini.php

echo "Activating extensions"
sed -i "s+'force_virtual_host' => false,+'force_virtual_host' => true,+g" livehelperchat/lhc_web/settings/settings.ini.default.php
sed -i "s+// 0 => 'customstatus',+'lhcphpresque'+g" livehelperchat/lhc_web/settings/settings.ini.default.php
sed -i "s+'worker' => 'http'+'worker' => 'resque'+g" livehelperchat/lhc_web/settings/settings.ini.default.php

echo "Dependencies installation finished. You now can run 'docker-compose -f docker-compose-standard.yml pull && docker-compose -f docker-compose-standard.yml up' and navigate your browser to http://127.0.0.1:8081 to finish installation"