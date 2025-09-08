/**
 * Build Management Tools
 */

import {
	encodeJobPath,
	parseScheduleTime,
	isSuccessStatus,
	formatError,
} from "../utils/jenkins.js";


/**
 * Trigger a build for a Jenkins job
 */
export async function triggerBuild(client, args) {
	const { jobFullName, parameters = {} } = args;
	const jobPath = encodeJobPath(jobFullName);

	try {
		// First, get the CSRF token (crumb) if CSRF protection is enabled
		let crumb = null;
		let crumbField = null;
		
		try {
			const crumbResponse = await client.get(`${client.baseUrl}/crumbIssuer/api/json`);
			if (crumbResponse.status === 200) {
				crumb = crumbResponse.data.crumb;
				crumbField = crumbResponse.data.crumbRequestField || "Jenkins-Crumb";
			}
		} catch (error) {
			// CSRF might be disabled, continue without it
			console.log("CSRF protection might be disabled or not accessible");
		}

		const hasParameters = Object.keys(parameters).length > 0;
		let response;
		
		// Prepare headers
		const headers = {
			"Content-Type": "application/x-www-form-urlencoded",
		};
		
		// Add CSRF token if available
		if (crumb && crumbField) {
			headers[crumbField] = crumb;
		}

		if (hasParameters) {
			// For parameterized builds
			const formData = new URLSearchParams();
			
			// Add parameters
			Object.entries(parameters).forEach(([key, value]) => {
				// Use 'parameter' format that Jenkins expects
				formData.append(`name`, key);
				formData.append(`value`, String(value));
			});
			
			// Alternative format - try this if above doesn't work
			// Object.entries(parameters).forEach(([key, value]) => {
			//     formData.append(key, String(value));
			// });

			response = await client.post(
				`${client.baseUrl}/job/${jobPath}/buildWithParameters`,
				formData.toString(),
				{ headers }
			);
		} else {
			// For non-parameterized builds, Jenkins might expect at least an empty form
			// or a specific parameter
			const formData = new URLSearchParams();
			
			// Some Jenkins versions expect a 'json' parameter even if empty
			formData.append("json", "{}");
			
			response = await client.post(
				`${client.baseUrl}/job/${jobPath}/build`,
				formData.toString(),
				{ headers }
			);
		}

		const isSuccess = isSuccessStatus(response.status);

		if (isSuccess) {
			const location =
				response.headers["location"] || response.headers["Location"];
			let queueId = null;

			if (location) {
				const match = location.match(/queue\/item\/(\d+)/);
				queueId = match ? match[1] : null;
			}

			return {
				success: true,
				message: `Build triggered successfully for ${jobFullName}`,
				queueUrl: location || null,
				queueId: queueId,
				statusCode: response.status,
			};
		} else {
			return {
				success: false,
				message: `Build trigger returned status ${response.status}`,
				statusCode: response.status,
				statusText: response.statusText,
				data: response.data,
			};
		}
	} catch (error) {
		return formatError(error, "trigger build");
	}
}

/**
 * Schedule a Jenkins build to run at a specific time
 */
export async function scheduleBuild(client, args) {
	const { jobFullName, scheduleTime, parameters = {} } = args;
	const jobPath = encodeJobPath(jobFullName);

	try {
		const scheduledDate = parseScheduleTime(scheduleTime);
		const now = new Date();
		const delayInMs = scheduledDate.getTime() - now.getTime();
		const delayInSeconds = Math.floor(delayInMs / 1000);

		// Get CSRF token
		let crumb = null;
		let crumbField = null;
		
		try {
			const crumbResponse = await client.get(`${client.baseUrl}/crumbIssuer/api/json`);
			if (crumbResponse.status === 200) {
				crumb = crumbResponse.data.crumb;
				crumbField = crumbResponse.data.crumbRequestField || "Jenkins-Crumb";
			}
		} catch (error) {
			// CSRF might be disabled
			console.log("CSRF protection might be disabled or not accessible");
		}

		// Prepare headers
		const headers = {
			"Content-Type": "application/x-www-form-urlencoded",
		};
		
		if (crumb && crumbField) {
			headers[crumbField] = crumb;
		}

		// Build form data
		const formData = new URLSearchParams();
		
		// Add delay parameter
		formData.append("delay", `${delayInSeconds}sec`);
		
		// Add job parameters
		Object.entries(parameters).forEach(([key, value]) => {
			formData.append(key, String(value));
		});

		const hasParameters = Object.keys(parameters).length > 0;
		const endpoint = hasParameters ? "buildWithParameters" : "build";
		
		// For non-parameterized builds with delay, add json parameter
		if (!hasParameters) {
			formData.append("json", JSON.stringify({ parameter: [] }));
		}

		const response = await client.post(
			`${client.baseUrl}/job/${jobPath}/${endpoint}`,
			formData.toString(),
			{ headers }
		);

		const isSuccess = isSuccessStatus(response.status);

		if (isSuccess) {
			const location =
				response.headers["location"] || response.headers["Location"];
			let queueId = null;

			if (location) {
				const match = location.match(/queue\/item\/(\d+)/);
				queueId = match ? match[1] : null;
			}

			return {
				success: true,
				message: `Build scheduled successfully for ${jobFullName}`,
				scheduledTime: scheduledDate.toISOString(),
				scheduledTimeLocal: scheduledDate.toString(),
				delayInSeconds: delayInSeconds,
				queueUrl: location || null,
				queueId: queueId,
				statusCode: response.status,
			};
		} else {
			return {
				success: false,
				message: `Failed to schedule build: ${response.status}`,
				statusCode: response.status,
				statusText: response.statusText,
				data: response.data,
			};
		}
	} catch (error) {
		return formatError(error, "schedule build");
	}
}


/**
 * Update build display name and/or description
 */
export async function updateBuild(client, args) {
	const {
		jobFullName,
		buildNumber = null,
		displayName = null,
		description = null,
	} = args;
	const jobPath = encodeJobPath(jobFullName);
	const buildPath = buildNumber || "lastBuild";

	try {
		const buildInfo = await client.get(
			`${client.baseUrl}/job/${jobPath}/${buildPath}/api/json?tree=number,url,description`
		);

		if (buildInfo.status !== 200) {
			return {
				success: false,
				message: `Build not found: ${jobFullName}#${buildPath}`,
			};
		}

		const actualBuildNumber = buildInfo.data.number;
		const buildUrl = buildInfo.data.url;
		const updates = [];

		// Update description
		if (description !== null && description !== undefined) {
			try {
				const formData = new URLSearchParams();
				formData.append("description", description);

				const response = await client.post(
					`${client.baseUrl}/job/${jobPath}/${actualBuildNumber}/submitDescription`,
					formData.toString(),
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					}
				);

				if (isSuccessStatus(response.status)) {
					updates.push({
						field: "description",
						success: true,
						newValue: description,
						statusCode: response.status,
					});
				} else {
					updates.push({
						field: "description",
						success: false,
						error: `Failed with status ${response.status}`,
					});
				}
			} catch (error) {
				updates.push({
					field: "description",
					success: false,
					error: error.message,
				});
			}
		}

		// Display name - not available via REST API
		if (displayName !== null && displayName !== undefined) {
			updates.push({
				field: "displayName",
				success: false,
				error: "Not supported via REST API",
				workaround: "Use Jenkins Script Console with Groovy script",
			});
		}

		return {
			success: updates.some((u) => u.success),
			buildNumber: actualBuildNumber,
			buildUrl: buildUrl,
			updates: updates,
		};
	} catch (error) {
		return formatError(error, "update build");
	}
}

/**
 * Stop/kill a running Jenkins build
 */
export async function stopBuild(client, args) {
	const { jobFullName, buildNumber = null } = args;
	const jobPath = encodeJobPath(jobFullName);
	const buildPath = buildNumber || "lastBuild";

	try {
		// Get actual build number and check if build is running
		const buildInfo = await client.get(
			`${client.baseUrl}/job/${jobPath}/${buildPath}/api/json?tree=number,building,result,url`
		);

		if (buildInfo.status !== 200) {
			return {
				success: false,
				message: `Build not found: ${jobFullName}#${buildPath}`,
			};
		}

		const actualBuildNumber = buildInfo.data.number;
		const isBuilding = buildInfo.data.building;
		const buildUrl = buildInfo.data.url;

		if (!isBuilding) {
			return {
				success: false,
				message: `Build #${actualBuildNumber} is not currently running`,
				buildResult: buildInfo.data.result,
				buildUrl: buildUrl,
			};
		}

		// Try to stop the build (graceful stop)
		const stopResponse = await client.post(
			`${client.baseUrl}/job/${jobPath}/${actualBuildNumber}/stop`,
			null
		);

		if (isSuccessStatus(stopResponse.status)) {
			return {
				success: true,
				message: `Build #${actualBuildNumber} stop request sent successfully`,
				buildNumber: actualBuildNumber,
				buildUrl: buildUrl,
				action: "stop",
			};
		}

		// If stop fails, try kill (forceful termination)
		const killResponse = await client.post(
			`${client.baseUrl}/job/${jobPath}/${actualBuildNumber}/kill`,
			null
		);

		if (isSuccessStatus(killResponse.status)) {
			return {
				success: true,
				message: `Build #${actualBuildNumber} kill request sent successfully`,
				buildNumber: actualBuildNumber,
				buildUrl: buildUrl,
				action: "kill",
			};
		}

		return {
			success: false,
			message: `Failed to stop build #${actualBuildNumber}`,
			statusCode: stopResponse.status,
		};
	} catch (error) {
		return formatError(error, "stop build");
	}
}
