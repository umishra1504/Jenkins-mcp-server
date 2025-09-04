# 🚀 Getting Started with Jenkins MCP Server

This guide shows how different users can install and start using the Jenkins MCP Server with various AI tools and MCP clients.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **Jenkins instance** running and accessible
- **Jenkins API Token** (recommended) or username/password
- **MCP-compatible client** (VS Code with Copilot, Claude Desktop, etc.)

---

## 🛠️ Installation Methods

### Method 1: Global Installation (Recommended)

```bash
# Install globally via npm
npm install -g jenkins-mcp-server

# Verify installation
jenkins-mcp --version
```

### Method 2: Local Project Installation

```bash
# In your project directory
npm install jenkins-mcp-server

# Use with npx
npx jenkins-mcp-server
```

### Method 3: Use with npx (No Installation Required)

```bash
# Run directly without installing
npx jenkins-mcp-server
```

---

## 🔑 Jenkins Setup

### 1. Get Jenkins API Token (Recommended)

1. **Login to Jenkins** → Click your username (top right) → **Configure**
2. Scroll to **API Token** section → Click **Add new Token**
3. Give it a name (e.g., "MCP Server") → Click **Generate** 
4. **Copy the token** - you'll need it for configuration

### 2. Alternative: Basic Authentication

If API tokens aren't available, you can use username/password, but API tokens are more secure.

---

## 🤖 Client-Specific Setup Guides

## 🔵 **GitHub Copilot (VS Code)**

### Step 1: Install MCP Extension
1. Open **VS Code**
2. Install the **MCP extension** from the marketplace
3. Restart VS Code

### Step 2: Configure MCP
1. Open **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type **"MCP: Edit Configuration"**
3. Add this configuration to your `mcp.json`:

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
      }
    }
  }
}
```

### Step 3: Test the Connection
1. Open a new chat with Copilot
2. Ask: *"Can you check my Jenkins status?"*
3. Copilot should use the Jenkins MCP tools to respond

---

## 🟠 **Claude Desktop**

### Step 1: Install Claude Desktop
Download from: https://claude.ai/download

### Step 2: Configure MCP
1. **Find config location:**
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/claude-desktop/claude_desktop_config.json`

2. **Edit the config file:**

```json
{
  "mcpServers": {
    "jenkins": {
      "command": "npx",
      "args": ["jenkins-mcp-server"],
      "env": {
        "JENKINS_URL": "http://your-jenkins-instance:8080",
        "JENKINS_USERNAME": "your-username", 
        "JENKINS_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Step 3: Restart Claude Desktop
Close and reopen Claude Desktop for changes to take effect.

### Step 4: Test
Ask Claude: *"What Jenkins tools are available?"*

---

## 🟢 **Other MCP Clients**

### Cursor IDE
```json
{
  "mcp": {
    "servers": {
      "jenkins": {
        "command": "npx",
        "args": ["jenkins-mcp-server"],
        "env": {
          "JENKINS_URL": "http://localhost:8080",
          "JENKINS_USERNAME": "your-username",
          "JENKINS_API_TOKEN": "your-token"
        }
      }
    }
  }
}
```

### Zed Editor
Add to Zed's settings:
```json
{
  "language_servers": {
    "jenkins-mcp": {
      "command": "npx",
      "args": ["jenkins-mcp-server"],
      "environment": {
        "JENKINS_URL": "http://localhost:8080",
        "JENKINS_USERNAME": "your-username",
        "JENKINS_API_TOKEN": "your-token"
      }
    }
  }
}
```

---

## ⚙️ Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `JENKINS_URL` | ✅ | Jenkins instance URL | `http://localhost:8080` |
| `JENKINS_USERNAME` | ✅ | Jenkins username | `john.doe` |
| `JENKINS_API_TOKEN` | ✅ | Jenkins API token | `11c4f3...` |

### Alternative Configuration Methods

#### 1. Using .env file (for local development)
```bash
# Create .env file in your project
echo "JENKINS_URL=http://localhost:8080" > .env
echo "JENKINS_USERNAME=your-username" >> .env  
echo "JENKINS_API_TOKEN=your-token" >> .env
```

#### 2. Using system environment variables
```bash
# Windows (PowerShell)
$env:JENKINS_URL="http://localhost:8080"
$env:JENKINS_USERNAME="your-username"
$env:JENKINS_API_TOKEN="your-token"

# macOS/Linux (Bash)
export JENKINS_URL="http://localhost:8080"
export JENKINS_USERNAME="your-username" 
export JENKINS_API_TOKEN="your-token"
```

---

## 🧪 Testing Your Setup

### 1. Quick Health Check
Ask your AI assistant:
```
"Can you check my Jenkins server status?"
```

Expected response: Information about Jenkins status, executors, and queue.

### 2. List Available Jobs
```
"What Jenkins jobs are available?"
```

Expected response: List of your Jenkins jobs with their status.

### 3. Trigger a Build
```
"Can you trigger a build for job 'my-project'?"
```

Expected response: Confirmation that build was triggered with queue ID.

### 4. Check Build History
```
"Show me the latest build information for 'my-project'"
```

Expected response: Detailed build information including status, duration, etc.

---

## 🛠️ Available Tools & Use Cases

### Build Management
- **Trigger builds**: `"Trigger a build for my-app with parameter ENV=staging"`
- **Stop builds**: `"Stop the running build for my-app"`
- **Schedule builds**: `"Schedule my-app build for 10:30 PM"`
- **Update builds**: `"Update the description of build #123 to 'Hotfix release'"`

### Job Information  
- **Job details**: `"Show me details about the my-app job"`
- **Build info**: `"Get information about build #123 of my-app"`
- **List jobs**: `"List all jobs in the 'production' folder"`

### System Monitoring
- **User info**: `"Who am I in Jenkins?"`
- **System status**: `"What's the Jenkins server status?"`

### Artifact Management
- **List artifacts**: `"List artifacts from the latest my-app build"`
- **Read artifacts**: `"Show me the content of test-results.xml from build #123"`

### Queue Management
- **Queue status**: `"What builds are in the queue?"`
- **Cancel builds**: `"Cancel the queued build for my-app"`

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Authentication Errors
```
Error: Authentication failed - check username and API token
```
**Solution**: 
- Verify `JENKINS_USERNAME` and `JENKINS_API_TOKEN` are correct
- Test credentials by logging into Jenkins web interface
- Regenerate API token if needed

#### 2. Connection Issues
```
Error: ECONNREFUSED or timeout
```
**Solution**:
- Check `JENKINS_URL` is correct and accessible
- Verify Jenkins is running
- Check firewall settings
- Try accessing Jenkins URL in browser

#### 3. Permission Issues
```
Error: Permission denied - check job permissions
```
**Solution**:
- Ensure Jenkins user has appropriate permissions
- Check job-level security settings
- Verify user can access jobs through web interface

#### 4. MCP Server Not Found
```
Error: Command 'jenkins-mcp-server' not found
```
**Solution**:
- Install the package: `npm install -g jenkins-mcp-server`
- Or use with npx: `npx jenkins-mcp-server`
- Check Node.js and npm are installed

#### 5. Tools Not Available in AI Client
```
AI says: "I don't have access to Jenkins tools"
```
**Solution**:
- Restart your AI client after configuration
- Check MCP configuration syntax
- Verify environment variables are set correctly
- Check AI client supports MCP (VS Code Copilot, Claude Desktop, etc.)

### Debug Mode
Enable debug logging:
```bash
# Set debug environment variable
export DEBUG=jenkins-mcp:*

# Then run your MCP client
```

---

## 📚 Example Workflows

### 1. Daily Development Workflow
```
1. "What's my Jenkins server status?"
2. "List jobs in the 'dev' folder"  
3. "Trigger a build for my-feature-branch"
4. "Check the latest build status for my-app"
5. "If the build failed, show me the artifacts"
```

### 2. Release Management
```
1. "List all jobs in production folder"
2. "Schedule a production deployment for 2 AM"
3. "Check queue status before deployment"
4. "Trigger release build with version parameter"
5. "Monitor build progress and artifacts"
```

### 3. Troubleshooting Failed Builds
```
1. "Show me the latest build for broken-job"
2. "List artifacts from the failed build"  
3. "Read the error logs artifact"
4. "Stop any running builds for this job"
5. "Trigger a new build after fixing issues"
```

---

## 🤝 Getting Help

- **GitHub Issues**: https://github.com/umishra1504/Jenkins-mcp-server/issues
- **Documentation**: https://github.com/umishra1504/Jenkins-mcp-server#readme
- **npm Package**: https://www.npmjs.com/package/jenkins-mcp-server

---

## 🎯 Next Steps

1. **✅ Install** the package using your preferred method
2. **✅ Configure** your AI client with Jenkins credentials  
3. **✅ Test** the connection with basic commands
4. **✅ Explore** the available tools and workflows
5. **✅ Integrate** into your daily development process

Happy building with Jenkins MCP Server! 🚀
