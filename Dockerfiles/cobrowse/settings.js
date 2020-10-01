var settings = {}

// Initialize main variables
settings.web = {};
settings.debug = {};

/**
 * Set path where socket.io is located, it can be also just socket.io
 * */
settings.socketiopath = 'socket.io';

/**
 * Set your settings
 * */
settings.web.host = "0.0.0.0";
settings.web.port = 31130;

/**
 * Enable debug output
 * */
settings.debug.output = true;

module.exports = settings;