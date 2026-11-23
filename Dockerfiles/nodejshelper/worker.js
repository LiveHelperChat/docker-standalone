var SCWorker = require('socketcluster/scworker');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var healthChecker = require('sc-framework-health-check');
var crypto = require('crypto');

var CHAT_CHANNEL_RE = /^chat_(?:\d+_)?\d+$/;
var ONLINE_VISITOR_CHANNEL_RE = /^uo_[A-Za-z0-9._-]+$/;
var VISITOR_CHAT_ALLOWED_OPS = { vt: true, vts: true, vi_online: true };

function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    var bufA = Buffer.from(a, 'utf8');
    var bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

class Worker extends SCWorker {
    run() {
        console.log('   >> Worker PID:', process.pid);
        var environment = this.options.environment;
        var secretHash = this.options.secretHash;
        var onlineTrack = this.options.trackVisitors;

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

                if (!token || typeof token !== 'object') {
                    respond('Login failed');
                    return ;
                }

                if (typeof token.hash === 'object' && token.hash !== null) {
                    if (typeof token.hash.hash !== 'string') {
                        respond('Login failed');
                        return ;
                    }
                    token.instance_id = typeof token.hash.instance_id !== 'number' ? 0 : token.hash.instance_id;
                    token.hash = token.hash.hash;
                }

                if (typeof token.instance_id !== 'number') {
                    token.instance_id = 0;
                }

                if (typeof token.hash !== 'string' || typeof token.chanelName !== 'string' || token.chanelName.length === 0) {
                    respond('Login failed');
                    return ;
                }

                var tokenParts = token.hash.split('.');
                var secNow = Math.round(Date.now()/1000);

                if (tokenParts.length === 2 && /^\d+$/.test(tokenParts[1]) && parseInt(tokenParts[1], 10) > (secNow - 60*60)) {
                    var SHA1 = function(input){
                        return crypto.createHash('sha1').update(input).digest('hex');
                    };

                    var isVisitor = false, isChatToken = false;
                    var validateVisitorHash = null;

                    if (CHAT_CHANNEL_RE.test(token.chanelName)) {
                        var parts = token.chanelName.split('_');
                        // Chat hash
                        validateVisitorHash = SHA1(tokenParts[1] + 'Visitor' + secretHash + '_' + parts[parts.length - 1]);
                        isChatToken = true;
                    } else if (ONLINE_VISITOR_CHANNEL_RE.test(token.chanelName)) {
                        // Online visitor hash
                        validateVisitorHash = SHA1(tokenParts[1] + 'Visitor' + secretHash);
                    }

                    var validateOperatorHash = SHA1(tokenParts[1] + 'Operator' + secretHash);
                    var matchedOperator = safeEqual(tokenParts[0], validateOperatorHash);
                    var matchedVisitor = !matchedOperator && validateVisitorHash !== null && safeEqual(tokenParts[0], validateVisitorHash);

                    if (matchedVisitor || matchedOperator) {
                        respond();
                        isVisitor = matchedVisitor;
                        socket.setAuthToken({
                            token: token.hash,
                            exp: (secNow + (isVisitor ? 120*60 : 60*12*60)),
                            chanelName: token.chanelName,
                            instance_id: token.instance_id,
                            isChatToken: isVisitor ? isChatToken : false,
                            isVisitor: isVisitor
                        });
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
                } else if (socket.authToken !== null && socket.authToken.isVisitor === true && onlineTrack === true && ONLINE_VISITOR_CHANNEL_RE.test(socket.authToken.chanelName)) {
                    scServer.exchange.publish('ous_' + socket.authToken.instance_id, {'op':'vi_online', 'status':false, 'vid': socket.authToken.chanelName.slice(3)});
                }
            });
        });

        scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE,
            function (req, next) {

                var authToken = req.socket.authToken;
                if (!authToken || typeof req.channel !== 'string' || req.channel.length === 0) {
                    next('You are not authorized to subscribe to ' + req.channel); // Block
                    return;
                }

                if (authToken.isVisitor === true) {
                    if (authToken.isChatToken === true) {
                        if (!CHAT_CHANNEL_RE.test(authToken.chanelName) || req.channel !== authToken.chanelName) {
                            next('You are not authorized to subscribe to ' + req.channel); // Block
                            return;
                        }
                        // Inform operator that visitor has restored connection
                        req.socket.authToken.chanelNameChat = req.channel;
                        scServer.exchange.publish(req.channel, {'op':'vi_online','status':true});
                        next(); // Allow
                        return;
                    }

                    // Online site visitor: only allow subscribing to own uo_<vid> channel
                    if (!ONLINE_VISITOR_CHANNEL_RE.test(authToken.chanelName) || req.channel !== authToken.chanelName) {
                        next('You are not authorized to subscribe to ' + req.channel); // Block
                        return;
                    }

                    if (onlineTrack === true) {
                        scServer.exchange.publish('ous_' + authToken.instance_id, {'op':'vi_online', 'status':true, 'vid': authToken.chanelName.slice(3)});
                    }

                    next(); // Allow
                    return;
                }

                // Authenticated operator (isVisitor === false)
                next(); // Allow
            }
        );

        scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN, function (req, next) {
            var authToken = req.socket.authToken;
            if (!authToken || typeof req.channel !== 'string' || req.channel.length === 0) {
                next('You are not authorized to publish to ' + req.channel);
                return;
            }

            if (authToken.isVisitor === true) {
                if (authToken.isChatToken === true) {
                    if (
                        !CHAT_CHANNEL_RE.test(authToken.chanelName) ||
                        req.channel !== authToken.chanelName ||
                        !req.data ||
                        typeof req.data !== 'object' ||
                        !VISITOR_CHAT_ALLOWED_OPS[req.data.op]
                    ) {
                        next('You are not authorized to publish to ' + req.channel);
                        return;
                    }
                    next();
                    return;
                }

                // Online site visitor: allow publishing to own uo_<vid> channel,
                // or reporting own online presence to ous_<instance_id>.
                if (ONLINE_VISITOR_CHANNEL_RE.test(authToken.chanelName)) {
                    if (req.channel === authToken.chanelName) {
                        next();
                        return;
                    }
                    var ownVid = authToken.chanelName.slice(3);
                    if (
                        req.channel === ('ous_' + authToken.instance_id) &&
                        req.data &&
                        typeof req.data === 'object' &&
                        req.data.op === 'vi_online' &&
                        req.data.vid === ownVid
                    ) {
                        next();
                        return;
                    }
                }

                next('You are not authorized to publish to ' + req.channel);
                return;
            }

            // Authenticated operator (isVisitor === false)
            next();
        });
    }
}

new Worker();
