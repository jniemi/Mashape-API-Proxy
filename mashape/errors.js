exports.hasErrors = function(contentBody) {
	return exports.hasErrorsJSON(JSON.parse(contentBody));

}

exports.hasErrorsJSON = function(jsonContentBody) {
	if (jsonContentBody.errors != null && jsonContentBody.errors.length > 0) {
		var error = jsonContentBody.errors[0];
		console.error("Error code " + error.code + ": " + error.message);
		return true;
	}
	return false;

}
