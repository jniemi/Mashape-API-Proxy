/*
 * Mashape API Proxy.
 *
 * Copyright (C) 2011 Mashape, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * The author of this software is Mashape, Inc.
 * For any question or feedback please contact us at: support@mashape.com
 *
 */

var url = require('url');
var http_client = require('./../http/http_client');
var mashape_errors = require('./../mashape/errors');
var querystring = require('querystring');

var ARG_SERVERKEY = "--serverKey";
var ARG_FORWARDTO = "--forwardTo";
var ARG_PORT = "--port";

var conf = null;

exports.setAsync = function(async) {
	conf.async = async;
	console.log("Configuration changed! Async is now \"" + conf.async + "\"");
}

exports.loadConfiguration = function(callback) {
	if (conf == null) {
		console.info("Loading configuration..");
		initConfiguration(callback);
	} else {
		callback(conf);
	}
}

function initConfiguration(callback) {
	conf = { port : 8080, serverKey : null, async : true, hasForward : false, forwardPort : 80, forwardHost : null, forwardPath : '', forwardSecure : false};
	loadArgs();
	loadAsyncInfo(function() {
		logInfo();
		callback(conf);
	});
	
}

function loadArgs() {
	var arguments = process.argv;
	for (i=0;i<arguments.length;i++) {
		var argument = arguments[i];
		if (startsWith(argument, ARG_FORWARDTO)) {
			try {
				var forwardUrl = getArgumentValue(argument);
				var urlObject = url.parse(forwardUrl);
				conf.forwardHost = urlObject.hostname;
				conf.forwardPort = parseInt(urlObject.port);
				if (isNaN(conf.forwardPort)) {
					conf.forwardPort = 80;
				}
				conf.forwardPath = (urlObject.pathname == "/") ? "" : urlObject.pathname;
				if (urlObject.protocol == "http:" || urlObject.protocol == "https:") {
					conf.forwardSecure = (startsWith(urlObject.protocol, "https")) ? true : false;
				} else {
					console.error("Only HTTP or HTTPS are supported");
					throw new Exception();
				}
				conf.hasForward = true;
			} catch (err) {
				console.error("Argument error: invalid " + ARG_FORWARDTO + " value");
				process.exit(1);
			}	
		} else if (startsWith(argument, ARG_SERVERKEY)) {
			conf.serverKey = getArgumentValue(argument);
		} else if (startsWith(argument, ARG_PORT)) {
			try {
				conf.port = parseInt(getArgumentValue(argument));
				if (isNaN(conf.port)) {
					throw new Exception();
				}
			} catch (err) {
				console.error("Argument error: invalid " + ARG_PORT + " value");
				process.exit(1);	
			}
		}
	}
}

function loadAsyncInfo(callback) {
	// Secure=true (HTTPS)
	http_client.doPost('api.mashape.com', '/requestInfo', {"serverkey":conf.serverKey}, true, function(contentBody) {
		if (mashape_errors.hasErrors(contentBody)) {
			process.exit(1);
		} else {
			conf.async = JSON.parse(contentBody).async;
			callback();
		}
	});
}

function startsWith(text, pattern) {
	return text.substr(0, pattern.length) == pattern;
}

function getArgumentValue(argument) {
	var parts = argument.split("=");
	if (parts.length > 1) {
		return argument.split("=")[1];
	}
	return null;
}

function logInfo() {
	console.info("- Proxy server port: " + conf.port);
	console.info("- Is async: " + conf.async);
	console.info("- Server Key: " + conf.serverKey);
	if (conf.hasForward) {
		console.info("- Forwarding to host: " + conf.forwardHost);
		console.info("- Forwarding to port: " + conf.forwardPort);
		console.info("- Forwarding to path: " + conf.forwardPath);
		console.info("- Forwarding to SSL protocol: " + conf.forwardSecure);
	} else {
		console.info("- Forwarding to: original request's host");
	}
}
