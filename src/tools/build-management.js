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
		const hasParameters = Object.keys(parameters).length > 0;
		let response;

		if (hasParameters) {
			const queryParams = new URLSearchParams();
			Object.entries(parameters).forEach(([key, value]) => {
				queryParams.append(key, String(value));
			});

			response = await client.post(
				`${
					client.baseUrl
				}/job/${jobPath}/buildWithParameters?${queryParams.toString()}`,
				null
			);
		} else {
			response = await client.post(
				`${client.baseUrl}/job/${jobPath}/build`,
				null
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

		const queryParams = new URLSearchParams();
		queryParams.append("delay", `${delayInSeconds}sec`);

		Object.entries(parameters).forEach(([key, value]) => {
			queryParams.append(key, String(value));
		});

		const hasParameters = Object.keys(parameters).length > 0;
		const endpoint = hasParameters ? "buildWithParameters" : "build";

		const response = await client.post(
			`${
				client.baseUrl
			}/job/${jobPath}/${endpoint}?${queryParams.toString()}`,
			null
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
