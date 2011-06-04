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
