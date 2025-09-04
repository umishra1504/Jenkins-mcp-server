# Contributing to Jenkins MCP Server

We love your input! We want to make contributing to this project as easy and transparent as possible.

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/jenkins-mcp-server.git`
3. **Install dependencies**: `npm install`
4. **Make your changes**
5. **Test your changes**: `npm test` and `npm run check`
6. **Submit a pull request**

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/utkarsh-mishra/jenkins-mcp-server.git
cd jenkins-mcp-server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Jenkins details

# Start development server
npm run dev
```

## 📝 Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update the CHANGELOG.md** with your changes
3. **Ensure any install or build dependencies are removed**
4. **Make sure all tests pass**: `npm run check`
5. **Update version numbers** following [SemVer](http://semver.org/)

## 🏗️ Adding New Tools

To add a new Jenkins tool:

1. **Create the tool function** in appropriate file under `src/tools/`
2. **Add tool definition** to `src/tools/index.js`
3. **Add documentation** to README.md
4. **Test the tool** thoroughly
5. **Add examples** in the documentation

## 🐛 Bug Reports

**Great Bug Reports** tend to have:

-   A quick summary and/or background
-   Steps to reproduce (be specific!)
-   What you expected would happen
-   What actually happens
-   Notes (possibly including why you think this might be happening)

## 💡 Feature Requests

We're always looking to improve! Feature requests are welcome.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

Be respectful, inclusive, and constructive in all interactions.
