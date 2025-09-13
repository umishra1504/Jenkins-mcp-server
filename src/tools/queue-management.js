/**
 * Queue Management Tools
 */

import axios from "axios";
import {
	encodeJobPath,
	isSuccessStatus,
	formatError,
	success,
	failure,
} from "../utils/jenkins.js";

/**
 * Cancel a pending/queued Jenkins build that hasn't started yet
 */
export async function cancelQueuedBuild(client, args) {
	const { jobFullName, queueId = null } = args;
	const jobPath = encodeJobPath(jobFullName);

	try {
		// If queueId is provided, cancel that specific item
		if (queueId) {
			const cancelResponse = await client.post(
				`${client.baseUrl}/queue/cancelItem`,
				`id=${queueId}`,
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}
			);

			if (
				isSuccessStatus(cancelResponse.status) ||
				cancelResponse.status === 204
			) {
				return success("cancelQueuedBuild", {
					message: `Queue item #${queueId} cancelled successfully`,
					queueId,
					method: "direct",
				});
			} else {
				return failure(
					"cancelQueuedBuild",
					`Failed to cancel queue item #${queueId}`,
					{ statusCode: cancelResponse.status }
				);
			}
		}

		// If no queueId provided, find and cancel all queued items for this job
		const queueResponse = await client.get(
			`${client.baseUrl}/queue/api/json`
		);

		if (queueResponse.status !== 200) {
			return failure(
				"cancelQueuedBuild",
				"Failed to fetch queue information",
				{ statusCode: queueResponse.status }
			);
		}

		const queueItems = queueResponse.data.items || [];

		// Find items for this specific job
		const jobQueueItems = queueItems.filter((item) => {
			if (item.task && item.task.url) {
				const itemJobPath = item.task.url
					.replace(client.baseUrl, "")
					.replace(/^\//, "")
					.replace(/\/$/, "");
				const targetJobPath = `job/${jobPath}`.replace(/\/$/, "");
				return itemJobPath === targetJobPath;
			}

			if (item.task && item.task.name) {
				const jobName = jobFullName.split("/").pop();
				return (
					item.task.name === jobFullName || item.task.name === jobName
				);
			}

			return false;
		});

		if (jobQueueItems.length === 0) {
			return failure(
				"cancelQueuedBuild",
				`No queued builds found for job: ${jobFullName}`,
				{ totalQueueItems: queueItems.length }
			);
		}

		// Cancel all found queue items for this job
		const cancelResults = [];
		for (const item of jobQueueItems) {
			try {
				const cancelResponse = await client.post(
					`${client.baseUrl}/queue/cancelItem`,
					`id=${item.id}`,
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					}
				);

				cancelResults.push({
					queueId: item.id,
					success:
						isSuccessStatus(cancelResponse.status) ||
						cancelResponse.status === 204,
					statusCode: cancelResponse.status,
					why: item.why || "No reason provided",
					inQueueSince: item.inQueueSince,
					params: item.params,
				});
			} catch (error) {
				cancelResults.push({
					queueId: item.id,
					success: false,
					error: error.message,
				});
			}
		}

		const successCount = cancelResults.filter((r) => r.success).length;
		const allSuccess = successCount === cancelResults.length;

		return allSuccess
			? success("cancelQueuedBuild", {
					message: `Successfully cancelled ${successCount} queued build(s) for ${jobFullName}`,
					cancelledItems: cancelResults,
					totalCancelled: successCount,
					totalFound: jobQueueItems.length,
			  })
			: failure(
					"cancelQueuedBuild",
					`Cancelled ${successCount} out of ${cancelResults.length} queued build(s)`,
					{
						cancelledItems: cancelResults,
						totalCancelled: successCount,
						totalFound: jobQueueItems.length,
					}
			  );
	} catch (error) {
		return formatError(error, "cancel queued build");
	}
}

/**
 * Get information about queued builds
 */
export async function getQueueInfo(client, args = {}) {
	const { jobFullName = null } = args;
	try {
		const queueResponse = await client.get(
			`${client.baseUrl}/queue/api/json`
		);

		if (queueResponse.status !== 200) {
			return failure(
				"getQueueInfo",
				"Failed to fetch queue information",
				{ statusCode: queueResponse.status }
			);
		}

		const allItems = queueResponse.data.items || [];

		// If jobFullName is specified, filter for that job
		if (jobFullName) {
			const jobPath = encodeJobPath(jobFullName);

			const filteredItems = allItems.filter((item) => {
				if (item.task && item.task.url) {
					const itemJobPath = item.task.url
						.replace(client.baseUrl, "")
						.replace(/^\//, "")
						.replace(/\/$/, "");
					const targetJobPath = `job/${jobPath}`.replace(/\/$/, "");
					return itemJobPath === targetJobPath;
				}

				if (item.task && item.task.name) {
					const jobName = jobFullName.split("/").pop();
					return (
						item.task.name === jobFullName ||
						item.task.name === jobName
					);
				}

				return false;
			});

			return success("getQueueInfo", {
				jobName: jobFullName,
				queueItems: filteredItems.map((item) => ({
					id: item.id,
					why: item.why || "Waiting",
					stuck: item.stuck || false,
					blocked: item.blocked || false,
					buildable: item.buildable !== false,
					inQueueSince: new Date(item.inQueueSince).toISOString(),
					queuedFor:
						Math.floor((Date.now() - item.inQueueSince) / 1000) +
						" seconds",
					params: item.params,
					taskName: item.task?.name,
					taskUrl: item.task?.url,
				})),
				totalInQueue: filteredItems.length,
			});
		}

		// Return all queue items
		return success("getQueueInfo", {
			queueItems: allItems.map((item) => ({
				id: item.id,
				taskName: item.task?.name || "Unknown",
				taskUrl: item.task?.url,
				why: item.why || "Waiting",
				stuck: item.stuck || false,
				blocked: item.blocked || false,
				buildable: item.buildable !== false,
				inQueueSince: new Date(item.inQueueSince).toISOString(),
				queuedFor:
					Math.floor((Date.now() - item.inQueueSince) / 1000) +
					" seconds",
				params: item.params,
			})),
			totalInQueue: allItems.length,
			summary: {
				total: allItems.length,
				stuck: allItems.filter((i) => i.stuck).length,
				blocked: allItems.filter((i) => i.blocked).length,
				buildable: allItems.filter((i) => i.buildable !== false).length,
			},
		});
	} catch (error) {
		return formatError(error, "get queue info");
	}
}

/**
 * Get a specific queued item by queueId (helper tool)
 */
export async function getQueueItem(client, args = {}) {
	const { queueId } = args;
	if (queueId === undefined || queueId === null) {
		return failure("getQueueItem", "queueId is required");
	}
	try {
		const res = await client.get(
			`${client.baseUrl}/queue/item/${queueId}/api/json`
		);
		if (res.status === 200) {
			// Determine if it has transitioned to a build
			const executable = res.data?.executable;
			return success("getQueueItem", {
				queueId,
				blocked: res.data?.blocked || false,
				buildable: res.data?.buildable !== false,
				stuck: res.data?.stuck || false,
				why: res.data?.why || "Waiting",
				params: res.data?.params,
				taskName: res.data?.task?.name,
				taskUrl: res.data?.task?.url,
				executable: executable
					? {
							number: executable.number,
							url: executable.url,
					  }
					: null,
				transitioned: Boolean(executable),
			});
		}
		return failure("getQueueItem", `Queue item not found: ${queueId}`, {
			statusCode: res.status,
		});
	} catch (error) {
		return formatError(error, "getQueueItem");
	}
}
