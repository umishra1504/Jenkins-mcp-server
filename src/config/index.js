/**
 * Configuration settings for the Jenkins MCP Server
 */

export const config = {
	// Jenkins connection settings
	jenkins: {
		url: process.env.JENKINS_URL || "http://localhost:8080",
		user:
			process.env.JENKINS_USERNAME || process.env.JENKINS_USER || "test",
		token: process.env.JENKINS_API_TOKEN || "lol@123",
	},

	// Server settings
	server: {
		name: "jenkins-mcp-server",
		version: "1.0.0",
		description:
			"Jenkins MCP Server with DataFile Workspace Support for Data Seeding Framework",
	},

	// Tool settings
	tools: {
		maxLimit: 10, // Maximum items to return in paginated requests
		defaultTimeout: 30000, // Default timeout for HTTP requests
		maxRedirects: 0, // Maximum redirects to follow
	},
};

export default config;
