# Jenkins MCP Server Quick Setup Script for Windows
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "🚀 Jenkins MCP Server Quick Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed  
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install jenkins-mcp-server
Write-Host "📦 Installing jenkins-mcp-server..." -ForegroundColor Cyan
try {
    npm install -g jenkins-mcp-server
    Write-Host "✅ jenkins-mcp-server installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Installation failed. You can use: npx jenkins-mcp-server" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Configuration Setup" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Collect Jenkins configuration
$JENKINS_URL = Read-Host "Enter your Jenkins URL (e.g., http://localhost:8080)"
$JENKINS_USERNAME = Read-Host "Enter your Jenkins username"
$JENKINS_API_TOKEN = Read-Host "Enter your Jenkins API token" -AsSecureString
$JENKINS_API_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($JENKINS_API_TOKEN))

# Create environment file
@"
JENKINS_URL=$JENKINS_URL
JENKINS_USERNAME=$JENKINS_USERNAME  
JENKINS_API_TOKEN=$JENKINS_API_TOKEN
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ Environment file (.env) created!" -ForegroundColor Green
Write-Host ""

# Show MCP configuration examples
Write-Host "📋 MCP Client Configuration Examples" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔵 For VS Code Copilot (mcp.json):" -ForegroundColor Blue
@"
{
  "servers": {
    "jenkins": {
      "command": "npx",
      "args": ["jenkins-mcp-server"],
      "env": {
        "JENKINS_URL": "$JENKINS_URL",
        "JENKINS_USERNAME": "$JENKINS_USERNAME",
        "JENKINS_API_TOKEN": "$JENKINS_API_TOKEN"
      }
    }
  }
}
"@ | Write-Host -ForegroundColor White

Write-Host ""
Write-Host "🟠 For Claude Desktop:" -ForegroundColor DarkYellow
@"
{
  "mcpServers": {
    "jenkins": {
      "command": "npx", 
      "args": ["jenkins-mcp-server"],
      "env": {
        "JENKINS_URL": "$JENKINS_URL",
        "JENKINS_USERNAME": "$JENKINS_USERNAME",
        "JENKINS_API_TOKEN": "$JENKINS_API_TOKEN"
      }
    }
  }
}
"@ | Write-Host -ForegroundColor White

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy the appropriate configuration to your MCP client" -ForegroundColor White
Write-Host "2. Restart your AI client (VS Code, Claude Desktop, etc.)" -ForegroundColor White  
Write-Host "3. Test by asking: 'What is my Jenkins server status?'" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see: USER_GUIDE.md" -ForegroundColor Cyan
Write-Host "🐛 For issues, visit: https://github.com/umishra1504/Jenkins-mcp-server/issues" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy building! 🚀" -ForegroundColor Green
