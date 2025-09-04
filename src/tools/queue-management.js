/**
 * Queue Management Tools
 */

import axios from "axios";
import {
	encodeJobPath,
	isSuccessStatus,
	formatError,
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
				return {
					success: true,
					message: `Queue item #${queueId} cancelled successfully`,
					queueId: queueId,
					method: "direct",
				};
			} else {
				return {
					success: false,
					message: `Failed to cancel queue item #${queueId}`,
					statusCode: cancelResponse.status,
				};
			}
		}

		// If no queueId provided, find and cancel all queued items for this job
		const queueResponse = await client.get(
			`${client.baseUrl}/queue/api/json`
		);

		if (queueResponse.status !== 200) {
			return {
				success: false,
				message: "Failed to fetch queue information",
				statusCode: queueResponse.status,
			};
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
			return {
				success: false,
				message: `No queued builds found for job: ${jobFullName}`,
				totalQueueItems: queueItems.length,
			};
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

		return {
			success: allSuccess,
			message: allSuccess
				? `Successfully cancelled ${successCount} queued build(s) for ${jobFullName}`
				: `Cancelled ${successCount} out of ${cancelResults.length} queued build(s)`,
			cancelledItems: cancelResults,
			totalCancelled: successCount,
			totalFound: jobQueueItems.length,
		};
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
			return {
				success: false,
				message: "Failed to fetch queue information",
				statusCode: queueResponse.status,
			};
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

			return {
				success: true,
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
			};
		}

		// Return all queue items
		return {
			success: true,
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
		};
	} catch (error) {
		return formatError(error, "get queue info");
	}
}
