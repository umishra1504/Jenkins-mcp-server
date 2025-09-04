# 🚀 Quick Start Guide - Jenkins MCP Server

**Welcome to Jenkins MCP Server!** This guide gets you up and running in under 5 minutes.

## 📦 Installation (Choose One)

### Option 1: Quick Install & Use

```bash
# No installation needed - use directly
npx jenkins-mcp-server
```

### Option 2: Global Installation

```bash
# Install once, use anywhere
npm install -g jenkins-mcp-server
```

## ⚡ Quick Configuration

### 1. Get Your Jenkins API Token

1. Jenkins Web UI → Your Profile → Configure → API Token → Generate

### 2. Set Environment Variables

```bash
export JENKINS_URL="http://localhost:8080"
export JENKINS_USERNAME="your-username"
export JENKINS_API_TOKEN="your-token"
```

### 3. Configure Your AI Client

#### VS Code Copilot

Add to `mcp.json`:

```json
{
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
```

#### Claude Desktop

Add to config file:

```json
{
	"mcpServers": {
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
```

## 🧪 Test Your Setup

Ask your AI assistant:

```
"What is my Jenkins server status?"
```

## 📚 Full Documentation

-   **Detailed Setup**: [USER_GUIDE.md](./USER_GUIDE.md)
-   **All Features**: [README.md](./README.md)
-   **Changes**: [CHANGELOG.md](./CHANGELOG.md)

## 🆘 Need Help?

-   🐛 **Issues**: https://github.com/umishra1504/Jenkins-mcp-server/issues
-   📖 **Documentation**: https://github.com/umishra1504/Jenkins-mcp-server
-   📦 **npm Package**: https://www.npmjs.com/package/jenkins-mcp-server

---

**That's it!** You're now ready to manage Jenkins through your AI assistant! 🎉
