var http = require('http');
var https = require('https');
var querystring = require('querystring');

exports.doPost = function doPost(host, path, data, secure, callback) {
	var content = querystring.stringify(data);
	
	var options = {  
	    host: host,  
	    port: (secure) ? 443 : 80,  
	    path: path,  
	    method: 'POST',  
	    headers: {  
		'Content-Type': 'application/x-www-form-urlencoded',  
		'Content-Length': content.length,
		'Host': host
	    }  
	}; 
	var httpObject = http;
	if (secure) {
		httpObject = https;
	}
	var http_request = httpObject.request(options, function(http_response) {
		exports.readContentBody(http_response, function(parameters) {
			if (callback) {
				callback(parameters);
			}
		});
	});
	
	http_request.on('error', function(e) {
	  console.error(e);
	});
	
	http_request.write(content);
    http_request.end();
}

exports.readContentBody = function readContentBody(object, callback) {
	var contentBody = '';

	

	object.on('data', function(chunk) {
      		contentBody += chunk.toString();
    	});
	
	object.on('end', function() {
		if (callback) {
			callback(contentBody);
		}
	});
}
