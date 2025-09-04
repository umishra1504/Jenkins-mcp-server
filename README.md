# Jenkins MCP Server

A comprehensive Jenkins Model Context Protocol (MCP) server that provides tools for managing Jenkins builds, jobs, artifacts, and queue operations through the MCP interface.

## 📋 Table of Contents

-   [Features](#-features)
-   [Architecture](#-architecture)
-   [Installation](#-installation)
-   [Configuration](#-configuration)
-   [Available Tools](#-available-tools)
-   [Usage Examples](#-usage-examples)
-   [Development](#-development)
-   [Contributing](#-contributing)
-   [License](#-license)

## 🚀 Features

-   **Build Management**: Trigger, stop, schedule, and update Jenkins builds
-   **Job Information**: Retrieve comprehensive job and build information
-   **System Monitoring**: Get Jenkins instance status and health information
-   **Artifact Management**: List and read build artifacts
-   **Queue Operations**: Manage and monitor build queues
-   **CSRF Protection**: Automatic handling of Jenkins CSRF tokens
-   **Authentication**: Support for Jenkins API tokens and basic auth

## 🏗️ Architecture

The codebase is organized into a modular, scalable structure:

```
src/
├── index.js                 # Main entry point
├── client/
│   └── jenkins-client.js    # Jenkins HTTP client with auth & CSRF
├── server/
│   └── mcp-server.js        # MCP server implementation
├── tools/
│   ├── index.js             # Tool registry and management
│   ├── build-management.js  # Build-related operations
│   ├── job-info.js          # Job information retrieval
│   ├── system-info.js       # System status and user info
│   ├── artifact-management.js # Artifact operations
│   └── queue-management.js  # Queue operations
├── config/
│   └── index.js             # Configuration management
└── utils/
    └── jenkins.js           # Utility functions
```

## 📦 Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd jenkins-mcp
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure environment variables** (see [Configuration](#-configuration))

4. **Start the server:**

    ```bash
    npm start
    ```

    Or for development with auto-restart:

    ```bash
    npm run dev
    ```

## ⚙️ Configuration

Configure the server using environment variables:

```bash
# Required: Jenkins instance URL
export JENKINS_URL="http://your-jenkins-instance:8080"

# Required: Jenkins username
export JENKINS_USER="your-username"

# Required: Jenkins API token (recommended)
export JENKINS_API_TOKEN="your-api-token"
```

### Getting a Jenkins API Token

1. Log into your Jenkins instance
2. Click on your username (top right) → Configure
3. Under "API Token", click "Add new Token"
4. Give it a name and click "Generate"
5. Copy the generated token and use it as `JENKINS_API_TOKEN`

### MCP Client Configuration

This Jenkins MCP Server can be integrated with various MCP clients. Here's how to configure it with popular clients:

#### 🤖 **GitHub Copilot (VS Code)**

1. **Install the MCP extension** in VS Code
2. **Add to your mcp.json**:
    ```json
    {
    	"servers": {
    		"jenkins": {
    			"command": "node",
    			"args": ["path/to/jenkins-mcp/src/index.js"],
    			"env": {
    				"JENKINS_URL": "http://your-jenkins-instance:8080",
    				"JENKINS_USER": "your-username",
    				"JENKINS_API_TOKEN": "your-api-token"
    			}
    		}
    	}
    }
    ```

#### 🧠 **Claude Desktop**

1. **Edit Claude's config file** (`~/.config/claude-desktop/claude_desktop_config.json`):
    ```json
    {
    	"mcpServers": {
    		"jenkins": {
    			"command": "node",
    			"args": ["path/to/jenkins-mcp/src/index.js"],
    			"env": {
    				"JENKINS_URL": "http://your-jenkins-instance:8080",
    				"JENKINS_USER": "your-username",
    				"JENKINS_API_TOKEN": "your-api-token"
    			}
    		}
    	}
    }
    ```

#### ⚡ **EliteA MCP Client**

1. **Add to EliteA configuration**(config.json):
    ```json
    {
    	"servers": {
    		"jenkins-mcp": {
    			"type": "stdio",
    			"command": "node",
    			"args": ["path/to/jenkins-mcp/src/index.js"],
    			"environment": {
    				"JENKINS_URL": "http://your-jenkins-instance:8080",
    				"JENKINS_USER": "your-username",
    				"JENKINS_API_TOKEN": "your-api-token"
    			}
    		}
    	}
    }
    ```

**Important Notes:**

-   Replace `path/to/jenkins-mcp/src/index.js` with the actual absolute path to your installation
-   Ensure Node.js is in your system PATH
-   The server communicates via stdin/stdout following the MCP protocol
-   All Jenkins tools will be available once configured

## 🛠️ Available Tools

### Build Management

#### `triggerBuild`

Trigger a build for a Jenkins job.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **parameters** (object, optional): Build parameters

#### `stopBuild`

Stop or kill a running Jenkins build.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **buildNumber** (integer, optional): Build number to stop (defaults to last build)

#### `scheduleBuild`

Schedule a Jenkins build to run at a specific time.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **scheduleTime** (string, required): Time to schedule (e.g., '22:15', '10:30 PM')
-   **parameters** (object, optional): Build parameters

#### `updateBuild`

Update build display name and/or description.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **buildNumber** (integer, optional): Build number (defaults to last build)
-   **displayName** (string, optional): New display name
-   **description** (string, optional): New description

### Job Information

#### `getJob`

Get information about a Jenkins job.

-   **jobFullName** (string, required): Full path of the Jenkins job

#### `getBuild`

Get information about a specific build or the last build.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **buildNumber** (integer, optional): Build number (defaults to last build)

#### `getJobs`

Get a paginated list of Jenkins jobs.

-   **parentFullName** (string, optional): Full path of the parent folder
-   **skip** (integer, optional): Number of items to skip (default: 0)
-   **limit** (integer, optional): Maximum items to return (default: 10, max: 10)

### System Information

#### `whoAmI`

Get information about the current authenticated user.

#### `getStatus`

Get Jenkins instance status and health information.

### Artifact Management

#### `listBuildArtifacts`

List all artifacts from a specific build or the last build.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **buildNumber** (integer, optional): Build number (defaults to last build)

#### `readBuildArtifact`

Read the content of a specific build artifact.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **artifactPath** (string, required): Relative path to the artifact
-   **buildNumber** (integer, optional): Build number (defaults to last build)
-   **format** (string, optional): Format for binary files ('text' or 'base64')

### Queue Management

#### `cancelQueuedBuild`

Cancel a pending/queued Jenkins build that hasn't started yet.

-   **jobFullName** (string, required): Full path of the Jenkins job
-   **queueId** (integer, optional): Specific queue item ID to cancel

#### `getQueueInfo`

Get information about queued builds.

-   **jobFullName** (string, optional): Full path of the Jenkins job (returns all if not provided)

## 💡 Usage Examples

### Triggering a Build

```json
{
	"tool": "triggerBuild",
	"arguments": {
		"jobFullName": "my-project/main-build",
		"parameters": {
			"BRANCH": "main",
			"ENVIRONMENT": "staging"
		}
	}
}
```

### Getting Build Information

```json
{
	"tool": "getBuild",
	"arguments": {
		"jobFullName": "my-project/main-build",
		"buildNumber": 123
	}
}
```

### Reading an Artifact

```json
{
	"tool": "readBuildArtifact",
	"arguments": {
		"jobFullName": "my-project/main-build",
		"artifactPath": "target/test-results.xml",
		"format": "text"
	}
}
```

### Scheduling a Build

```json
{
	"tool": "scheduleBuild",
	"arguments": {
		"jobFullName": "my-project/nightly-build",
		"scheduleTime": "22:30",
		"parameters": {
			"FULL_TEST": "true"
		}
	}
}
```

## 🔧 Development

### Adding New Tools

1. **Create the tool function** in the appropriate file under `src/tools/`
2. **Add the tool definition** to `src/tools/index.js` in the `toolRegistry`
3. **Update the README** with the new tool documentation

Example tool structure:

```javascript
export async function myNewTool(client, param1, param2) {
	try {
		// Tool implementation
		const result = await client.get("/some/endpoint");
		return {
			success: true,
			data: result.data,
		};
	} catch (error) {
		return formatError(error, "my operation");
	}
}
```

### Project Structure Explained

-   **`src/client/`**: HTTP client for Jenkins API communication
-   **`src/server/`**: MCP server implementation and request handling
-   **`src/tools/`**: Individual tool implementations organized by functionality
-   **`src/config/`**: Configuration management and environment variables
-   **`src/utils/`**: Shared utility functions

### Code Style

-   Use ES6+ features and async/await
-   Follow consistent error handling patterns
-   Include JSDoc comments for functions
-   Use descriptive variable and function names
-   Maintain modular structure for scalability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Troubleshooting

### Common Issues

#### Authentication Errors

-   Ensure `JENKINS_API_TOKEN` is correctly set
-   Verify the token has appropriate permissions
-   Check if the Jenkins user has access to the jobs

#### CSRF Token Issues

-   The server automatically handles CSRF tokens
-   Ensure Jenkins CSRF protection is enabled
-   For older Jenkins versions, you may need to disable CSRF protection

#### Connection Issues

-   Verify `JENKINS_URL` is accessible
-   Check firewall settings
-   Ensure Jenkins is running and responding

#### Tool Execution Errors

-   Check job names and paths are correct
-   Verify build numbers exist
-   Ensure proper permissions for the requested operations

For more specific issues, enable debug logging by setting:

```bash
export DEBUG=jenkins-mcp:*
```

---

**Made with ❤️ by Utkarsh Mishra**
