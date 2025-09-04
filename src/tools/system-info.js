/**
 * System Information Tools
 */

import { formatError } from "../utils/jenkins.js";

/**
 * Get information about the current authenticated user
 */
export async function whoAmI(client) {
	try {
		const response = await client.get("/whoAmI/api/json");
		if (response.status === 200) {
			return {
				success: true,
				user: response.data,
			};
		}
		return {
			success: false,
			message: "Failed to get user info",
		};
	} catch (error) {
		return formatError(error, "get user info");
	}
}

/**
 * Get Jenkins instance status and health information
 */
export async function getStatus(client) {
	try {
		const [overallLoad, queue, nodes] = await Promise.all([
			client.get("/overallLoad/api/json"),
			client.get("/queue/api/json"),
			client.get("/computer/api/json"),
		]);

		const status = {
			queueLength: queue.data?.items?.length || 0,
			totalExecutors: overallLoad.data?.totalExecutors || 0,
			busyExecutors: overallLoad.data?.busyExecutors || 0,
			availableExecutors: overallLoad.data?.availableExecutors || 0,
			nodes:
				nodes.data?.computer?.map((c) => ({
					displayName: c.displayName,
					offline: c.offline,
					numExecutors: c.numExecutors,
				})) || [],
		};

		return {
			success: true,
			status,
		};
	} catch (error) {
		return formatError(error, "get status");
	}
}
