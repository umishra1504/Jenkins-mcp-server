# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-09-08

### Fixed

-   **EliteA MCP Client Compatibility**: Fixed triggerBuild and scheduleBuild not working with EliteA client
    -   Improved parameter detection to handle different argument formats from various MCP clients
    -   Added robust argument parsing for jobFullName and parameters
    -   Fixed "Nothing is submitted" error when triggering builds with parameters
    -   Added debug logging for better troubleshooting
    -   Enhanced parameter validation and error reporting

### Added

-   **Debug Logging**: Added console.log statements to help diagnose build trigger issues
-   **Better Error Messages**: More descriptive error messages when parameters are missing
-   **MCP Client Agnostic**: Works with VS Code Copilot, Claude Desktop, EliteA, and other MCP clients

### Removed

-   **Setup Scripts**: Removed setup.sh and setup.ps1 automated setup scripts
-   **GITHUB_SETUP.md**: Removed redundant GitHub setup documentation
-   Keep comprehensive USER_GUIDE.md for detailed setup instructions

## [1.0.1] - 2025-09-04

### Fixed

-   **Repository URL**: Fixed incorrect GitHub repository URL in package.json metadata
    -   Updated from `https://github.com/utkarsh-mishra/jenkins-mcp-server.git`
    -   To correct URL: `https://github.com/umishra1504/Jenkins-mcp-server.git`
-   **Homepage and Bugs URLs**: Updated to point to correct GitHub repository
-   **npm Registry**: Package now displays correct repository links

## [1.0.0] - 2025-09-04

### Added

-   **Initial Release** of Jenkins MCP Server
-   **Build Management Tools:**
    -   `triggerBuild` - Trigger Jenkins builds with parameters
    -   `stopBuild` - Stop running builds (graceful and forceful)
    -   `scheduleBuild` - Schedule builds for future execution
    -   `updateBuild` - Update build descriptions and display names
-   **Job Information Tools:**
    -   `getJob` - Retrieve detailed job information
    -   `getBuild` - Get specific build details
    -   `getJobs` - List jobs with pagination support
-   **System Information Tools:**
    -   `whoAmI` - Get authenticated user information
    -   `getStatus` - Jenkins instance health and status
-   **Artifact Management Tools:**
    -   `listBuildArtifacts` - List all build artifacts
    -   `readBuildArtifact` - Read artifact contents (text/binary)
-   **Queue Management Tools:**
    -   `cancelQueuedBuild` - Cancel pending builds
    -   `getQueueInfo` - Monitor build queue status
-   **Security Features:**
    -   Automatic CSRF token handling
    -   Jenkins API token authentication
    -   Secure HTTP client implementation
-   **MCP Protocol Compliance:**
    -   Full Model Context Protocol v0.5.0 support
    -   Standard stdio transport
    -   Proper error handling and responses
-   **Developer Experience:**
    -   Comprehensive documentation
    -   Modular architecture
    -   TypeScript-ready structure
    -   Example configurations for popular MCP clients

### Technical Features

-   Node.js 18+ support
-   ES6 modules with async/await
-   Modular tool architecture
-   Comprehensive error handling
-   Configurable via environment variables
-   Production-ready logging
-   CLI executable support

### Documentation

-   Complete README with setup instructions
-   Tool documentation with examples
-   Troubleshooting guide
-   Configuration examples for:
    -   GitHub Copilot (VS Code)
    -   Claude Desktop
    -   EliteA MCP Client
-   API reference for all 12 tools
-   Contributing guidelines
-   MIT license
