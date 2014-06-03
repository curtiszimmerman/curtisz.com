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

var serverData = {
	listenPort: 2345
};

var server = http.createServer(function(req, res) {
	var pathname = url.parse(req.url).pathname;
	if (req.method == 'GET') {
		if (pathname == '/favicon.ico') {

		} else if (pathname == '/' || pathname == '/index.html') {

		} else if (pathname == '/default.css') {

		} else if (pathname == '/site.js') {

		} else if (pathname == '/') {

		} else {

		}
	} else if (req.method == 'POST') {
		if (pathname == '/') {
			
		}
	} else {

	}
})on('error', function(err) {
	_log.error('createServer: '+err);
}).listen(serverData.listenPort);