/**
 * Artifact Management Tools
 */

import {
	encodeJobPath,
	getMimeType,
	formatError,
	success,
	failure,
} from "../utils/jenkins.js";

/**
 * List all artifacts from a specific build or the last build
 */
export async function listBuildArtifacts(client, args) {
	const { jobFullName, buildNumber = null } = args;
	const jobPath = encodeJobPath(jobFullName);
	const buildPath = buildNumber || "lastBuild";

	try {
		const response = await client.get(
			`/job/${jobPath}/${buildPath}/api/json?tree=artifacts[fileName,relativePath,displayPath],number,url,result,timestamp`
		);

		if (response.status === 200) {
			const build = response.data;
			const artifacts = build.artifacts || [];

			return success("listBuildArtifacts", {
				buildNumber: build.number,
				buildUrl: build.url,
				buildResult: build.result,
				timestamp: build.timestamp,
				artifacts: artifacts.map((artifact) => ({
					fileName: artifact.fileName,
					relativePath: artifact.relativePath,
					displayPath: artifact.displayPath || artifact.relativePath,
					downloadUrl: `${client.baseUrl}/job/${jobPath}/${build.number}/artifact/${artifact.relativePath}`,
				})),
				totalArtifacts: artifacts.length,
			});
		}

		return failure(
			"listBuildArtifacts",
			`Build not found: ${jobFullName}#${buildPath}`,
			{ statusCode: response.status }
		);
	} catch (error) {
		return formatError(error, "list artifacts");
	}
}

/**
 * Read the content of a specific build artifact
 */
export async function readBuildArtifact(client, args) {
	const {
		jobFullName,
		artifactPath,
		buildNumber = null,
		format = "text",
	} = args;
	const jobPath = encodeJobPath(jobFullName);
	const buildPath = buildNumber || "lastBuild";

	try {
		// Get the actual build number if using 'lastBuild'
		let actualBuildNumber = buildNumber;
		if (!buildNumber) {
			const buildResponse = await client.get(
				`/job/${jobPath}/${buildPath}/api/json?tree=number`
			);
			if (buildResponse.status === 200) {
				actualBuildNumber = buildResponse.data.number;
			} else {
				throw new Error("Could not determine build number");
			}
		}

		const artifactUrl = `/job/${jobPath}/${actualBuildNumber}/artifact/${artifactPath}`;
		const responseType = format === "base64" ? "arraybuffer" : "text";

		const response = await client.get(artifactUrl, { responseType });

		if (response.status === 200) {
			let content;
			const mimeType = getMimeType(artifactPath);

			if (format === "base64") {
				content = Buffer.from(response.data).toString("base64");
			} else {
				content = response.data;
				const extension = artifactPath.split(".").pop().toLowerCase();
				if (
					extension === "json" ||
					(typeof content === "string" &&
						content.trim().startsWith("{"))
				) {
					try {
						content = JSON.parse(content);
					} catch {}
				}
			}

			return success("readBuildArtifact", {
				artifact: {
					path: artifactPath,
					buildNumber: actualBuildNumber,
					mimeType,
					format,
					size: response.headers["content-length"] || null,
					content,
				},
			});
		}

		return failure(
			"readBuildArtifact",
			`Artifact not found: ${artifactPath} in build ${actualBuildNumber}`,
			{ statusCode: response.status }
		);
	} catch (error) {
		if (error.response && error.response.status === 404) {
			return failure(
				"readBuildArtifact",
				`Artifact not found: ${artifactPath}`,
				{ statusCode: 404 }
			);
		}
		return formatError(error, "readBuildArtifact");
	}
}
