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

var configuration = require('./configuration/configuration');
var http = require('http');
var proxy = require('./proxy/proxy_client');
var mashape_validation = require('./mashape/mashape_validation');
var mashape_errors = require('./mashape/errors');

console.info("Starting Mashape Proxy. Please wait...");

var count = 0;

configuration.loadConfiguration(function(conf) {

	http.createServer(function(request, response) { 
	  var start = new Date().getTime();
	  count++;
	  if (conf.async) {
		mashape_validation.validateToken(request, conf, function(contentBody) {
			var jsonContentBody = JSON.parse(contentBody);
			changeAsync(conf, jsonContentBody);
		});
		proxy.doProxy(request, response, conf);
		var end = new Date().getTime();
		console.log("Request [# " + count.toString() + "] proxied in: " + (end-start) + "ms");
	  } else {
		  mashape_validation.validateToken(request, conf, function(contentBody) {
			var jsonContentBody = JSON.parse(contentBody);
			if (mashape_errors.hasErrorsJSON(jsonContentBody)) {
				console.log("Can't execute the request.");
				response.writeHead(200, {'Content-Type': 'application/json'});
  				response.end("{\"errors\":" + JSON.stringify(jsonContentBody.errors) + "}");
			} else {
				changeAsync(conf, jsonContentBody);
				proxy.doProxy(request, response, conf);
				var end = new Date().getTime();
				console.log("Request [# " + count.toString() + "] proxied in: " + (end-start) + "ms");
			}
		  });
	  }
	}).listen(conf.port);

	console.info("Mashape Proxy started on port " + conf.port);
});

function changeAsync(conf, jsonContentBody) {
	if (jsonContentBody.async != null && conf.async != jsonContentBody.async) {
		configuration.setAsync(jsonContentBody.async);
	}
}
