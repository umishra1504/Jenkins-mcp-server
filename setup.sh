#!/bin/bash

# Jenkins MCP Server Quick Setup Script
# This script helps users quickly set up the Jenkins MCP Server

echo "🚀 Jenkins MCP Server Quick Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install jenkins-mcp-server
echo "📦 Installing jenkins-mcp-server..."
npm install -g jenkins-mcp-server

if [ $? -eq 0 ]; then
    echo "✅ jenkins-mcp-server installed successfully!"
else
    echo "❌ Installation failed. Trying with npx instead..."
    echo "   You can use: npx jenkins-mcp-server"
fi

echo ""
echo "🔧 Configuration Setup"
echo "====================="
echo ""

# Collect Jenkins configuration
read -p "Enter your Jenkins URL (e.g., http://localhost:8080): " JENKINS_URL
read -p "Enter your Jenkins username: " JENKINS_USERNAME
read -s -p "Enter your Jenkins API token: " JENKINS_API_TOKEN
echo ""

# Create environment file
cat > .env << EOF
JENKINS_URL=$JENKINS_URL
JENKINS_USERNAME=$JENKINS_USERNAME
JENKINS_API_TOKEN=$JENKINS_API_TOKEN
EOF

echo "✅ Environment file (.env) created!"
echo ""

# Test connection
echo "🧪 Testing Jenkins connection..."
export JENKINS_URL="$JENKINS_URL"
export JENKINS_USERNAME="$JENKINS_USERNAME"
export JENKINS_API_TOKEN="$JENKINS_API_TOKEN"

# Show MCP configuration examples
echo ""
echo "📋 MCP Client Configuration Examples"
echo "===================================="
echo ""

echo "🔵 For VS Code Copilot (mcp.json):"
echo "{"
echo "  \"servers\": {"
echo "    \"jenkins\": {"
echo "      \"command\": \"npx\","
echo "      \"args\": [\"jenkins-mcp-server\"],"
echo "      \"env\": {"
echo "        \"JENKINS_URL\": \"$JENKINS_URL\","
echo "        \"JENKINS_USERNAME\": \"$JENKINS_USERNAME\","
echo "        \"JENKINS_API_TOKEN\": \"$JENKINS_API_TOKEN\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
echo ""

echo "🟠 For Claude Desktop:"
echo "{"
echo "  \"mcpServers\": {"
echo "    \"jenkins\": {"
echo "      \"command\": \"npx\","
echo "      \"args\": [\"jenkins-mcp-server\"],"
echo "      \"env\": {"
echo "        \"JENKINS_URL\": \"$JENKINS_URL\","
echo "        \"JENKINS_USERNAME\": \"$JENKINS_USERNAME\","
echo "        \"JENKINS_API_TOKEN\": \"$JENKINS_API_TOKEN\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
echo ""

echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Copy the appropriate configuration to your MCP client"
echo "2. Restart your AI client (VS Code, Claude Desktop, etc.)"
echo "3. Test by asking: 'What is my Jenkins server status?'"
echo ""
echo "📚 For detailed instructions, see: USER_GUIDE.md"
echo "🐛 For issues, visit: https://github.com/umishra1504/Jenkins-mcp-server/issues"
echo ""
echo "Happy building! 🚀"
