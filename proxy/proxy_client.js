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

var http = require('http');
var https = require('https');
var http_client = require('./../http/http_client');

exports.doProxy = function (request, response, conf) {
	var options;
	var httpObject = http;
	if (conf.hasForward) {
		var originalHeaders = request.headers;
		originalHeaders.host = conf.forwardHost;
		options = {  
			host: conf.forwardHost,  
			port: conf.forwardPort,
			path: conf.forwardPath + request.url,
			method: request.method,
			headers: originalHeaders
		}
		if (conf.forwardSecure) {
			httpObject = https;
		}
	} else {
		options = {  
			host: request.headers['host'],  
			port: 80,  
			path: request.url,  
			method: request.method,  
			headers: request.headers
		}
	}

	console.log("Proxying request to: " + options.host + options.path);

	var proxy_request = httpObject.request(options, function(proxy_response) {
		proxy_response.addListener('data', function(chunk) {
			response.write(chunk, 'binary');
		});
		proxy_response.addListener('end', function() {
			response.end();
		});
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function() {
		proxy_request.end();
	});
	proxy_request.end();
}
