#!/usr/bin/env node

/**
 * Jenkins MCP Server - Main Entry Point
 *
 * A comprehensive Jenkins Model Context Protocol (MCP) server that provides
 * tools for managing Jenkins builds, jobs, artifacts, and queue operations.
 *
 * Features:
 * - Build management (trigger, stop, schedule, update)
 * - Job information retrieval
 * - System status monitoring
 * - Artifact management
 * - Queue operations
 *
 * @author Utkarsh Mishra
 * @version 1.0.0
 */

import { JenkinsMcpServer } from "./server/mcp-server.js";
import { validateConfig } from "./config/index.js";

// Start the Jenkins MCP Server
async function main() {
	try {
		// Validate configuration before starting server
		if (!validateConfig()) {
			process.exit(1);
		}
		const server = new JenkinsMcpServer();
		await server.start();
	} catch (error) {
		console.error("Failed to start Jenkins MCP Server:", error);
		process.exit(1);
	}
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.error("Received SIGINT, shutting down gracefully...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.error("Received SIGTERM, shutting down gracefully...");
	process.exit(0);
});

main().catch(console.error);
