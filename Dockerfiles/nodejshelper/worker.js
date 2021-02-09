var SCWorker = require('socketcluster/scworker');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var healthChecker = require('sc-framework-health-check');
var crypto = require('crypto');

class Worker extends SCWorker {
  run() {
    console.log('   >> Worker PID:', process.pid);
    var environment = this.options.environment;

    var secretHash = this.options.secretHash;

    var app = express();

    var httpServer = this.httpServer;
    var scServer = this.scServer;

    if (environment === 'dev') {
      // Log every HTTP request. See https://github.com/expressjs/morgan for other
      // available formats.
      app.use(morgan('dev'));
    }
    app.use(serveStatic(path.resolve(__dirname, 'public')));

    // Add GET /health-check express route
    healthChecker.attach(this, app);

    httpServer.on('request', app);

    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', function (socket) {

      socket.on('login', function (token, respond) {
        if (typeof token.hash === 'undefined') {
          respond('Login failed');
          return ;
        }
        
        var tokenParts = token.hash.split('.');
        var secNow = Math.round(Date.now()/1000);

        if (tokenParts[1] > (secNow - 60*60)) {
            var SHA1 = function(input){
                return crypto.createHash('sha1').update(input).digest('hex');
            }

            var isVisitor = false, isChatToken = false;

            if (token.chanelName.indexOf('chat_') !== -1) {
                var parts = token.chanelName.split('_');
                // Chat hash
                var validateVisitorHash = SHA1(tokenParts[1] + 'Visitor' + secretHash + '_' + parts[parts.length - 1]);
                isChatToken = true;
            } else {
                // Online visitor hash
                var validateVisitorHash = SHA1(tokenParts[1] + 'Visitor' + secretHash);
            }

            var validateOperatorHash = SHA1(tokenParts[1] + 'Operator' + secretHash);

            if ((tokenParts[0] == validateVisitorHash) || (tokenParts[0] == validateOperatorHash)) {
                respond();
                isVisitor = (tokenParts[0] == validateVisitorHash);
                socket.setAuthToken({token:token.hash, exp: (secNow + (isVisitor ? 50*60 : 60*12*60)), chanelName:token.chanelName, isChatToken: isChatToken, isVisitor : isVisitor});
            } else {
                // Passing string as first argument indicates error
                respond('Login failed');
            }

        } else {
            respond('Login failed');
        }
      });

      socket.on('disconnect', function () {
          if (socket.authToken !== null && socket.authToken.chanelNameChat && socket.authToken.isVisitor === true) {
              scServer.exchange.publish(socket.authToken.chanelNameChat, {'op':'vi_online','status':false});
          }
      });
    });

    scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE,
         function (req, next) {

             var authToken = req.socket.authToken;
             if (authToken) {

                 if (req.channel.indexOf('chat_') !== -1 && authToken.isVisitor === true) {
                     // Inform operator that visitor has restored connection

                     if (authToken.isChatToken == true) {
                         req.socket.authToken.chanelNameChat = req.channel;
                         scServer.exchange.publish(req.channel, {'op':'vi_online','status':true})
                     } else {
                         next('You are not authorized to subscribe to ' + req.channel); // Block
                     }
                 }

                 next(); // Allow
             } else {
                 next('You are not authorized to subscribe to ' + req.channel); // Block
             }
         }
    );

    /*scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN, function (req, next) {
      var authToken = req.socket.authToken;
      if (authToken) {
        next();
      } else {
          console.log('block publish');
          next('You are not authorized to publish to ' + req.channel);
      }
    });*/
  }
}

new Worker();
