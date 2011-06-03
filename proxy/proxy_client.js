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
