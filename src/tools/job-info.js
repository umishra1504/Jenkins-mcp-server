/**
 * Job Information Tools
 */

import {
	encodeJobPath,
	formatError,
	success,
	failure,
} from "../utils/jenkins.js";

/**
 * Get information about a Jenkins job
 */
export async function getJob(client, args) {
	const { jobFullName } = args;
	if (!jobFullName) return failure("getJob", "jobFullName is required");
	const jobPath = encodeJobPath(jobFullName);

	try {
		const response = await client.get(`/job/${jobPath}/api/json`);
		if (response.status === 200) {
			return success("getJob", { job: response.data });
		}
		return failure("getJob", `Job not found: ${jobFullName}`, {
			statusCode: response.status,
		});
	} catch (error) {
		return formatError(error, "getJob");
	}
}

/**
 * Get information about a specific build or the last build
 */
export async function getBuild(client, args) {
	const { jobFullName, buildNumber = null } = args;
	if (!jobFullName) return failure("getBuild", "jobFullName is required");
	const jobPath = encodeJobPath(jobFullName);
	const buildPath = buildNumber || "lastBuild";

	try {
		const response = await client.get(
			`/job/${jobPath}/${buildPath}/api/json`
		);
		if (response.status === 200) {
			return success("getBuild", { build: response.data });
		}
		return failure(
			"getBuild",
			`Build not found: ${jobFullName}#${buildPath}`,
			{ statusCode: response.status }
		);
	} catch (error) {
		return formatError(error, "getBuild");
	}
}

/**
 * Get a paginated list of Jenkins jobs
 */
export async function getJobs(client, args = {}) {
	let { parentFullName = "", skip = 0, limit = 10 } = args;
	skip = Math.max(0, parseInt(skip, 10) || 0);
	limit = Math.min(10, Math.max(1, parseInt(limit, 10) || 10));
	const basePath = parentFullName
		? `/job/${encodeJobPath(parentFullName)}`
		: "";

	try {
		const response = await client.get(
			`${basePath}/api/json?tree=jobs[name,url,description,buildable,color]`
		);
		if (response.status === 200) {
			const jobs = response.data.jobs || [];
			const sortedJobs = jobs.sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const paginatedJobs = sortedJobs.slice(skip, skip + limit);
			return success("getJobs", {
				jobs: paginatedJobs,
				total: jobs.length,
				skip,
				limit,
			});
		}
		return failure("getJobs", "Failed to get jobs", {
			statusCode: response.status,
		});
	} catch (error) {
		return formatError(error, "getJobs");
	}
}
