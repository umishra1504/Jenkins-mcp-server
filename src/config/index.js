/**
 * Configuration settings for the Jenkins MCP Server
 */

export const config = {
	// Jenkins connection settings
	jenkins: {
		url: process.env.JENKINS_URL,
		user: process.env.JENKINS_USERNAME || process.env.JENKINS_USER,
		token: process.env.JENKINS_API_TOKEN,
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
		retries: parseInt(process.env.JENKINS_MCP_RETRIES || "2", 10), // Automatic retry attempts for transient errors
	},
};

/**
 * Validates that all required configuration is present
 * @returns {boolean} True if configuration is valid
 */
export function validateConfig() {
	const required = [
		{ key: "JENKINS_URL", value: config.jenkins.url },
		{ key: "JENKINS_USERNAME or JENKINS_USER", value: config.jenkins.user },
		{ key: "JENKINS_API_TOKEN", value: config.jenkins.token },
	];

	const missing = required.filter(({ value }) => !value);

	if (missing.length > 0) {
		console.error("❌ Missing required environment variables:");
		missing.forEach(({ key }) => console.error(`   ${key}`));
		console.error("\n📖 See USER_GUIDE.md for setup instructions");
		console.error('💡 Example: export JENKINS_URL="http://localhost:8080"');
		return false;
	}

	// Validate URL format
	try {
		new URL(config.jenkins.url);
	} catch (error) {
		console.error(
			"❌ Invalid JENKINS_URL format. Must be a valid URL (e.g., http://localhost:8080)"
		);
		return false;
	}

	return true;
}

export default config;
