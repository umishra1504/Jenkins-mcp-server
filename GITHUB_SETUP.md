# Creating GitHub repository guide

## Steps to create GitHub repository:

1. Go to https://github.com/new
2. Create repository named: jenkins-mcp-server
3. Don't initialize with README (you already have one)
4. Set as public repository
5. Add the remote and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/jenkins-mcp-server.git
git branch -M main
git push -u origin main
```

## Then update package.json repository URL to match your GitHub username
