# Jenkins MCP Server

🚀 AI-powered Jenkins management via Model Context Protocol. Trigger builds, manage jobs, and monitor CI/CD pipelines through your favorite AI assistant.

## � Installation

### Option 1: Global Installation (Recommended)

```bash
npm install -g jenkins-mcp-server
```

### Option 2: Local Installation

```bash
npm install jenkins-mcp-server
```

### Option 3: Use with npx (No Installation)

```bash
npx jenkins-mcp-server
```

## ⚙️ Configuration

Set required environment variables:

```bash
export JENKINS_URL="http://your-jenkins-instance:8080"
export JENKINS_USERNAME="your-username"
export JENKINS_API_TOKEN="your-api-token"
```

### Getting Jenkins API Token

1. Login to Jenkins → Click your username → Configure
2. Under "API Token" → Add new Token → Generate
3. Copy the token and use it as `JENKINS_API_TOKEN`

## 🤖 MCP Client Setup

### GitHub Copilot (VS Code)

Add to `mcp.json`:

```json
{
	"servers": {
		"jenkins": {
			"command": "npx",
			"args": ["jenkins-mcp-server"],
			"env": {
				"JENKINS_URL": "http://your-jenkins-instance:8080",
				"JENKINS_USERNAME": "your-username",
				"JENKINS_API_TOKEN": "your-api-token"
				// "ALLOW_ABSOLUTE_FILE_PARAMS": 1 // for file parameters with absolute paths 
			}
		}
	}
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
	"mcpServers": {
		"jenkins": {
			"command": "npx",
			"args": ["jenkins-mcp-server"],
			"env": {
				"JENKINS_URL": "http://your-jenkins-instance:8080",
				"JENKINS_USERNAME": "your-username",
				"JENKINS_API_TOKEN": "your-api-token",
				// "ALLOW_ABSOLUTE_FILE_PARAMS": 1 // for file parameters with absolute paths 
			}
		}
	}
}
```

## 🛠️ Available Tools

Each tool returns a JSON result with `success` plus additional fields. Provide arguments as an object when invoking via an MCP client.

### Build Management

**triggerBuild** – Start a job build (supports file + regular parameters)
Inputs:

-   `jobFullName` (string, required)
-   `parameters` (object, optional) – Key/value map. Any value that is a valid local file path is uploaded as a file parameter.

**File Parameter Security**: By default, only relative file paths are allowed. To enable absolute file paths, set `ALLOW_ABSOLUTE_FILE_PARAMS=1` in your environment variables.

Returns: `{ success, queueId, queueUrl, statusCode, message }`

**stopBuild** – Stop (or force kill) the running build
Inputs:

-   `jobFullName` (string, required)
-   `buildNumber` (integer, optional)
    Returns: `{ success, action: "stop"|"kill", buildNumber, buildUrl, message }`

**scheduleBuild** – Schedule a build in the future
Inputs:

-   `jobFullName` (string, required)
-   `scheduleTime` (string, required) – e.g. `22:15`, `10:30 PM`, or `2025-12-24 14:30`
-   `parameters` (object, optional)

**File Parameter Security**: By default, only relative file paths are allowed. To enable absolute file paths, set `ALLOW_ABSOLUTE_FILE_PARAMS=1` in your environment variables.

Returns: `{ status, queueUrl }`

**updateBuild** – Update build description (display name not supported via REST)
Inputs:

-   `jobFullName` (string, required)
-   `buildNumber` (integer, optional)
-   `description` (string, optional)
-   `displayName` (string, optional, ignored)
    Returns: `{ success, buildNumber, updates: [ { field, success, ... } ] }`

### Job Information

**getJob** – Job metadata
Inputs: `jobFullName` (string, required)

**getBuild** – Build details (specific or last)
Inputs:

-   `jobFullName` (string, required)
-   `buildNumber` (integer, optional)

**getJobs** – Paginated job list
Inputs:

-   `parentFullName` (string, optional)
-   `skip` (integer, optional, default 0)
-   `limit` (integer, optional, default 10, max 10)

### System Monitoring

**whoAmI** – Current authenticated user
Inputs: none

**getStatus** – Jenkins instance status / health
Inputs: none

### Artifact Management

**listBuildArtifacts** – List artifacts for build
Inputs:

-   `jobFullName` (string, required)
-   `buildNumber` (integer, optional)

**readBuildArtifact** – Read artifact content (text or base64)
Inputs:

-   `jobFullName` (string, required)
-   `artifactPath` (string, required)
-   `buildNumber` (integer, optional)
-   `format` (string, optional: `text` | `base64`)

### Queue Operations

**cancelQueuedBuild** – Cancel queued item(s)
Inputs:

-   `jobFullName` (string, required)
-   `queueId` (integer, optional)

**getQueueInfo** – List queued builds (optionally filtered)
Inputs:

-   `jobFullName` (string, optional)

Tip: Ask your AI assistant: "Trigger a build for job X with BRANCH=main" or "List artifacts for latest job X build".

## ⚡ Usage

After configuration, ask your AI assistant:

-   "Check my Jenkins server status"
-   "Trigger a build for my-app"
-   "Show me the latest build information"
-   "List all Jenkins jobs"

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---
