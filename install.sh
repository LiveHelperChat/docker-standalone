#!/bin/sh

echo "Cloning Live Helper Chat repository"
git clone https://github.com/LiveHelperChat/livehelperchat.git

echo "Cloning php-resque repository"
git clone https://github.com/LiveHelperChat/lhc-php-resque.git

echo "Cloning NodeJS repository"
git clone https://github.com/LiveHelperChat/NodeJS-Helper.git

echo "Creating symlinks."
cd livehelperchat/lhc_web/extension && ln -s ../../../lhc-php-resque/lhcphpresque lhcphpresque
cd ../../../

echo "Copying default lhcphpresque settings file"
cp livehelperchat/lhc_web/extension/lhcphpresque/settings/settings.ini.default.php livehelperchat/lhc_web/extension/lhcphpresque/settings/settings.ini.php

cd livehelperchat/lhc_web/extension && ln -s ../../../NodeJS-Helper/nodejshelper nodejshelper

echo "Copying default nodejshelper settings file"
cd ../../../
cp livehelperchat/lhc_web/extension/nodejshelper/settings/settings.ini.default.php livehelperchat/lhc_web/extension/nodejshelper/settings/settings.ini.php

echo "Activating extensions"
sed -i "s+// 0 => 'customstatus',+'lhcphpresque','nodejshelper'+g" livehelperchat/lhc_web/settings/settings.ini.default.php

echo "Dependencies installation finished. You now can run 'docker-compose up' and navigate your browser to http://127.0.0.1:8081 to finish installation"