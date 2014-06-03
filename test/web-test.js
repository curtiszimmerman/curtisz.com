/**
 * @file test-web.js
 * test file for primary application driver
 * @version 0.0.1a
 */

var expect = require('chai').expect;

var web = require('./../web.js');

var base64 = web.base64;
var getID = web.getID;
var sendFile = web.sendFile;
var sendStatus = web.sendStatus;

describe('base64', function() {
	it('should return a string when passed anything', function() {
		var result = base64('foo');
		// test
	});
});