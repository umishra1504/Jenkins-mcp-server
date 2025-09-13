/**
 * Utility functions for Jenkins operations
 */

/**
 * Encodes a Jenkins job path for URL usage
 * @param {string} jobFullName - Full path of the Jenkins job
 * @returns {string} - Encoded job path
 */
export function encodeJobPath(jobFullName) {
	return jobFullName.split("/").map(encodeURIComponent).join("/job/");
}

/**
 * Parses schedule time string into a Date object
 * @param {string} scheduleTime - Time string to parse
 * @returns {Date} - Parsed date object
 */
export function parseScheduleTime(scheduleTime) {
	const now = new Date();
	let scheduledDate;

	if (typeof scheduleTime === "string") {
		// Check if it's a time like "22:15" or "10:30 PM"
		if (scheduleTime.match(/^\d{1,2}:\d{2}(\s*(AM|PM))?$/i)) {
			scheduledDate = new Date();
			const timeParts = scheduleTime.match(
				/(\d{1,2}):(\d{2})(\s*(AM|PM))?/i
			);
			let hours = parseInt(timeParts[1]);
			const minutes = parseInt(timeParts[2]);
			const period = timeParts[4];

			if (period) {
				if (period.toUpperCase() === "PM" && hours < 12) {
					hours += 12;
				} else if (period.toUpperCase() === "AM" && hours === 12) {
					hours = 0;
				}
			}

			scheduledDate.setHours(hours, minutes, 0, 0);

			// If the time has already passed today, schedule for tomorrow
			if (scheduledDate <= now) {
				scheduledDate.setDate(scheduledDate.getDate() + 1);
			}
		} else {
			scheduledDate = new Date(scheduleTime);
		}
	} else if (scheduleTime instanceof Date) {
		scheduledDate = scheduleTime;
	} else {
		throw new Error(
			"Invalid schedule time format. Use '22:15', '10:30 PM', or a full date string."
		);
	}

	if (isNaN(scheduledDate.getTime())) {
		throw new Error("Could not parse the schedule time");
	}

	if (scheduledDate <= now) {
		throw new Error("Scheduled time must be in the future");
	}

	return scheduledDate;
}

/**
 * Determines MIME type based on file extension
 * @param {string} filename - Name of the file
 * @returns {string} - MIME type
 */
export function getMimeType(filename) {
	const extension = filename.split(".").pop().toLowerCase();
	const mimeTypes = {
		json: "application/json",
		xml: "application/xml",
		html: "text/html",
		txt: "text/plain",
		log: "text/plain",
		csv: "text/csv",
		jar: "application/java-archive",
		war: "application/java-archive",
		zip: "application/zip",
		tar: "application/x-tar",
		gz: "application/gzip",
		pdf: "application/pdf",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
	};
	return mimeTypes[extension] || "application/octet-stream";
}

/**
 * Checks if an HTTP status code indicates success
 * @param {number} statusCode - HTTP status code
 * @returns {boolean} - Whether the status indicates success
 */
export function isSuccessStatus(statusCode) {
	return [200, 201, 302, 303].includes(statusCode);
}

/**
 * Formats error response with helpful information
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed
 * @returns {object} - Formatted error response
 */
export function formatError(error, operation) {
	const status = error.response?.status;
	const errorInfo = {
		success: false,
		operation,
		message: error.message,
		statusCode: status,
		code: error.code,
	};

	if (status === 403) {
		errorInfo.authError = true;
		errorInfo.message =
			"Permission denied - check job permissions or CSRF settings";
	} else if (status === 401) {
		errorInfo.authError = true;
		errorInfo.message =
			"Authentication failed - check username and API token";
	} else if (status === 404) {
		errorInfo.message = `Resource not found during ${operation}`;
	}

	if (error.response?.data && typeof error.response.data === "object") {
		errorInfo.responseData = error.response.data;
	}

	return errorInfo;
}

/**
 * Uniform success envelope
 */
export function success(operation, data = {}) {
	return { success: true, operation, ...data };
}

/**
 * Uniform failure envelope
 */
export function failure(operation, message, meta = {}) {
	return { success: false, operation, message, ...meta };
}
