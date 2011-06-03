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
