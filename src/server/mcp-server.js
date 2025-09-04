/**
 * Jenkins MCP Server Implementation
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { JenkinsClient } from "../client/jenkins-client.js";
import { getAllTools, getToolHandler, hasToolNamed } from "../tools/index.js";
import config from "../config/index.js";

/**
 * Jenkins MCP Server class
 */
export class JenkinsMcpServer {
	constructor() {
		this.jenkinsUrl = config.jenkins.url;
		this.jenkinsUser = config.jenkins.user;
		this.jenkinsToken = config.jenkins.token;

		this.client = new JenkinsClient(
			this.jenkinsUrl,
			this.jenkinsUser,
			this.jenkinsToken
		);

		this.server = new Server(
			{
				name: config.server.name,
				version: config.server.version,
			},
			{
				capabilities: {
					tools: {},
				},
			}
		);

		this.setupHandlers();
	}

	/**
	 * Setup MCP server request handlers
	 */
	setupHandlers() {
		// Handle tool listing requests
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: getAllTools(),
		}));

		// Handle tool execution requests
		this.server.setRequestHandler(
			CallToolRequestSchema,
			async (request) => {
				const { name, arguments: args } = request.params;

				try {
					if (!hasToolNamed(name)) {
						throw new Error(`Unknown tool: ${name}`);
					}

					const handler = getToolHandler(name);
					const result = await handler(this.client, args);

					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error: ${error.message}`,
							},
						],
						isError: true,
					};
				}
			}
		);
	}

	/**
	 * Start the MCP server
	 */
	async start() {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error(`Jenkins MCP Server running for ${this.jenkinsUrl}`);
	}
}
