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
var configuration = require('./../configuration/configuration');
var querystring = require('querystring');

var TOKEN = "_token";
var LANGUAGE = "_language";
var VERSION = "_version";

exports.validateToken = function (request, conf, callback) {
	if (request.method == 'GET') {
		var query = url.parse(request.url, true).query;
		doValidateToken(query[TOKEN], query[LANGUAGE], query[VERSION], conf, callback);
    } else {
		http_client.readContentBody(request, function(contentBody) {
			var query = querystring.parse(contentBody);
			var token = query[TOKEN];
			var language = query[LANGUAGE];
			var version = query[VERSION];
			doValidateToken(token, language, version, conf, callback);
		});
	}
}

function doValidateToken(token, language, version, conf, callback) {
	//TODO: Support method name
	var parameters = {"token" : token, "serverkey" : conf.serverKey};	
	var methodName = "Say Hello";
	parameters.method = methodName;
	
	if (language && language != "") {
		parameters.language = language;
		if (version && version != "") {
			parameters.version = version;
		}
	}

	// Secure = true (HTTPS)
	http_client.doPost('api.mashape.com', '/validateToken', parameters, true, callback);
}
