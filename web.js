/**
 * @project curtisz.com
 * curtisz.com website
 * @file web.js
 * primary web server application driver
 * @author curtis zimmerman
 * @contact curtisz@curtisz.com
 * @license BSD3
 * @version 0.0.1a
 */

var fs = require('fs');
var http = require('http');
var url = require('url');

/*\
|*|
\*/
var _getID = function( IDLength ) {
	var IDLength = (typeof(IDLength) == 'number') ? IDLength : serverData.defaultIDLength;
	var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var id = '';
	for (int i=0; i<IDLength; i++) {
		id += charset.substr(Math.floor(Math.random*charset.length), 1);
	}
	return id;
};

/*\
|*|
\*/
var _log = (function() {
	function _console( data, type ) {
		var pre = ['[i] DEBUG: ', '[!] ERROR: ', '[+] '];
		console.log(pre[type]+data);
	};
	function _debug( data ) {
		if (serverData.debug) {
			_console(data, 0);
		}
	};
	function _error( data ) {
		_console(data, 1);
	};
	function _log( data ) {
		_console(data, 2);
	};
	return {
		debug: _debug,
		error: _error,
		log: _log
	};
})();

/*\
|*| pub/sub/unsub pattern utility closure
\*/
var _pubsub = (function() {
	var cache = {};
	function _flush() {
		cache = {};
	};
	function _pub( topic, args, scope ) {
		if (cache[topic]) {
			var currentTopic = cache[topic],
				topicLength = currentTopic.length;
			for (var i=0; i<topicLength; i++) {
				currentTopic[i].apply(scope || this, args || []);
			}
		}
	};
	function _sub( topic, callback ) {
		if (!cache[topic]) {
			cache[topic] = [];
		}
		cache[topic].push(callback);
		return [topic, callback];
	};
	function _unsub( handle, total ) {
		var topic = handle[0],
			cacheLength = cache[topic].length;
		if (cache[topic]) {
			for (var i=0; i<cacheLength; i++) {
				if (cache[topic][i] === handle) {
					cache[topic].splice(cache[topic][i], 1);
					if (total) {
						delete cache[topic];
					}
				}
			}
		}
	};
	return {
		flush: _flush,
		pub: _pub,
		sub: _sub,
		unsub: _unsub
	};
})();

/*\
|*|
\*/
var _sendFile = function( clientID, file ) {
	return false;
};

/*\
|*|
\*/
var _sendStatus = function( clientID, code ) {
	return false;
};

/*\
|*|
\*/
var _serverData = {
	defaultIDLength: 15,
	listenPort: 2345
};


/*\
|*| @function boot
|*| Bootstraps the environment for the application.
\*/
var boot = (function() {
	process.on('uncaughtException', function(err) {
		_log.error('uncaught exception: '+err.stack);
		process.exit(1);
	});
})();

/*\
|*|
\*/
var server = (function() {
	http.createServer(function(req, res) {
		var pathname = url.parse(req.url).pathname;
		if (req.method == 'GET') {
			if (pathname == '/favicon.ico') {

			} else if (pathname == '/' || pathname == '/index.html') {

			} else if (pathname == '/curtisz.css') {

			} else if (pathname == '/curtisz.js') {

			} else if (pathname == '/test/index.html') {
				_
 			} else if (pathname == '/test/mocha.css') {
				
			} else if (pathname == '/test/mocha.js') {
				
			} else if (pathname == '/test/tests.js') {
				
			} else {

			}
		} else if (req.method == 'POST') {
			if (pathname == '/') {

			}
		} else {

		}
	}).on('error', function(err) {
		_log.error('createServer: '+err);
	}).listen(serverData.listenPort);
})();