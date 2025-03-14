# GitHub Token Instructions

To add secrets to your GitHub repository, you need a GitHub Personal Access Token (PAT) with the correct permissions. Follow these steps to create a new token:

## Creating a New GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Click "Generate new token"
3. Give your token a descriptive name like "MCP Secrets Manager"
4. Set an expiration date (recommended: 30 days)
5. For "Repository access", select "Only select repositories" and choose the repository you want to add secrets to
6. Under "Permissions", expand "Repository permissions" and set the following:
   - "Actions" to "Read and write" (needed for managing secrets)
   - "Contents" to "Read and write" (needed for repository operations)
   - "Metadata" to "Read-only" (automatically selected)

7. Click "Generate token" at the bottom of the page
8. Copy the generated token (you won't be able to see it again!)

## Updating Your .env File

1. Open your `.env` file in the root of your project
2. Replace the existing GitHub token with your new token:

```
GITHUB_TOKEN=your_new_token_here
```

3. Save the file

## Testing Your Token

After updating your token, run the GitHub secrets test script again:

```
cd mcp-servers
node github_direct_test.js
```

Enter your GitHub username and repository name when prompted. The script should now be able to add your environment variables as secrets to your GitHub repository.

## Important Security Notes

- Never commit your `.env` file to a public repository
- Keep your token secure and don't share it with others
- Set an expiration date for your token to limit the risk if it's accidentally exposed
- Only grant the minimum permissions necessary for your token 