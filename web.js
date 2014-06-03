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
var __appData = {
	clients: {},
	defaultIDLength: 15,
	listenPort: 2345,
	mime: {
		'css': 'text/css',
		'gif': 'image/gif',
		'html': 'text/html',
		'ico': 'image-x/icon',
		'jpg': 'image/jpeg',
		'js': 'text/javascript',
		'png': 'image/png'
	},
	requestIDLength: 15
};

/*\
|*|
\*/
var _getID = function( IDLength ) {
	var IDLength = (typeof(IDLength) == 'number') ? IDLength : __appData.defaultIDLength;
	var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var id = '';
	for (var i=0; i<IDLength; i++) {
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
|*| @function _sendFile
|*| Sends a file to the specified requestID
\*/
var _sendFile = function( requestID, file, callback ) {
	fs.readFile(file, function(err, data) {
		if (err) {
			if (callback && typeof(callback) == 'function') {
				// ERROR
				// res.writeHead()
				// res.write()
				// res.end()
				callback(err);
			}
			_log.error(err);
		} else {
			var client = __appData.clients[requestID];
			var type = file.substr(file.lastIndexOf('.')+1);
			client.res.writeHead(200, {'Content-Type': __appData.mime[type]});
			client.res.write(data);
			client.res.end();
			if (callback && typeof(callback) == 'function') {
				callback(null, data);
			}
		}
	});
	return false;
};

/*\
|*|
\*/
var _sendStatus = function( requestID, code ) {
	var statusCode = (typeof(code) == 'number') ? code : 500;
	var statusMessage = "Internal Server Error";
	switch (code) {
		case 200:
			statusMessage = "Success";
			break;
		case 201:
			statusMessage = "Created";
			break;
		case 202:
			statusMessage = "Processed";
			break;
		case 401:
			statusMessage = "Unauthorized";
			break;
		case 403:
			statusMessage = "Forbidden";
			break;
		case 404:
			statusMessage = "Resource Not Found";
			break;
		case 405:
			statusMessage = "Method Not Supported";
			break;
		case 413:
			statusMessage = "Request Entity Too Large";
			break;
		default:
			// no need :)
			break;
	};
	var client = __appData.clients[requestID];
	client.res.writeHead(statusCode, statusMessage, {'Content-Type': 'text/html'});
	client.res.write('<!doctype html><html><head><meta charset="utf-8"></head><body>'+statusCode+': '+statusMessage+'</body></html>');
	client.res.end();
	return false;
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
	_pubsub.sub('/client/send/file', _sendFile);
	_pubsub.sub('/client/send/status', _sendStatus);
})();

var test = (function() {
	module.exports.getID = _getID;
	module.exports.sendFile = _sendFile;
	module.exports.sendStatus = _sendStatus;
	// for now, if called with require() (as in during a Mocha test), do not run the server
	if (require.main !== module) {
		__appData.kill = true;
	}
})();

/*\
|*|
\*/
var server = (function() {
	http.createServer(function(req, res) {
		var pathname = url.parse(req.url).pathname;
		var requestID = _getID(__appData.requestIDLength);
		var client = {
			res: res,
			timestamp: Math.round(new Date().getTime()/1000.0)
		};
		__appData.clients[requestID] = client;
		if (req.method == 'GET') {
			if (pathname == '/favicon.ico') {
				_pubsub.pub('/client/send/status', [requestID, 410]);
			} else if (pathname == '/' || pathname == '/index.html') {
				_pubsub.pub('/client/send/file', [requestID, 'lib/index.html']);
			} else if (pathname == '/curtisz.css') {
				_pubsub.pub('/client/send/file', [requestID, 'lib/curtisz.css']);
			} else if (pathname == '/curtisz.js') {
				_pubsub.pub('/client/send/file', [requestID, 'lib/curtisz.js']);
			} else if (pathname == '/test/') {
				_pubsub.pub('/client/send/file', [requestID, 'vendor/index.html']);
			} else if (pathname == '/test/index.html') {
				_pubsub.pub('/client/send/file', [requestID, 'vendor/index.html']);
 			} else if (pathname == '/test/mocha.css') {
				_pubsub.pub('/client/send/file', [requestID, 'vendor/mocha.css']);
			} else if (pathname == '/test/mocha.js') {
				_pubsub.pub('/client/send/file', [requestID, 'vendor/mocha.js']);
			} else if (pathname == '/test/tests.js') {
				_pubsub.pub('/client/send/file', [requestID, 'vendor/tests.js']);
			} else {
				_pubsub.pub('/client/send/status', [requestID, 404]);
			}
		} else if (req.method == 'POST') {
			if (pathname == '/') {
				_pubsub.pub('/client/send/status', [requestID, 200]);
			}
		} else {
			_pubsub.pub('/client/send/status', [requestID, 405]);
		}
	}).on('error', function(err) {
		_log.error('createServer: '+err);
	}).listen(__appData.listenPort);
})();