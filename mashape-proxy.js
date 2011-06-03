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
