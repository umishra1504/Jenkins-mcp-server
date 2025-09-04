/**
 * Job Information Tools
 */

import { encodeJobPath, formatError } from "../utils/jenkins.js";

/**
 * Get information about a Jenkins job
 */
export async function getJob(client, args) {
	const { jobFullName } = args;
	const jobPath = encodeJobPath(jobFullName);

	try {
		const response = await client.get(`/job/${jobPath}/api/json`);
		if (response.status === 200) {
			return {
				success: true,
				job: response.data,
			};
		}
		return {
			success: false,
			message: `Job not found: ${jobFullName}`,
		};
	} catch (error) {
		return formatError(error, "get job");
	}
}

/**
 * Get information about a specific build or the last build
 */
export async function getBuild(client, args) {
	const { jobFullName, buildNumber = null } = args;
	const jobPath = encodeJobPath(jobFullName);
	const buildPath = buildNumber || "lastBuild";

	try {
		const response = await client.get(
			`/job/${jobPath}/${buildPath}/api/json`
		);
		if (response.status === 200) {
			return {
				success: true,
				build: response.data,
			};
		}
		return {
			success: false,
			message: `Build not found: ${jobFullName}#${buildPath}`,
		};
	} catch (error) {
		return formatError(error, "get build");
	}
}

/**
 * Get a paginated list of Jenkins jobs
 */
export async function getJobs(client, args = {}) {
	const { parentFullName = "", skip = 0, limit = 10 } = args;
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
			const paginatedJobs = sortedJobs.slice(
				skip,
				skip + Math.min(limit, 10)
			);

			return {
				success: true,
				jobs: paginatedJobs,
				total: jobs.length,
			};
		}
		return {
			success: false,
			message: "Failed to get jobs",
		};
	} catch (error) {
		return formatError(error, "get jobs");
	}
}
