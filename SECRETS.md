# Secrets Management in MenuFacil

This document explains how secrets are managed in the MenuFacil project.

## Local Development Environment

For local development, we use a `.env` file to store sensitive tokens. This file is included in `.gitignore` to ensure it is not committed to the repository.

The `.env` file should contain:

```
GITHUB_TOKEN=your_github_token
VERCEL_TOKEN=your_vercel_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## GitHub Actions Environment

For GitHub Actions workflows, we use GitHub Secrets. These secrets are stored securely in your GitHub repository and can be accessed in workflows using the `secrets` context.

The following secrets are configured:

- `GH_PAT`: GitHub Personal Access Token (renamed from GITHUB_TOKEN to avoid GitHub naming restrictions)
- `VERCEL_TOKEN`: Vercel API Token
- `SUPABASE_URL`: Supabase URL
- `SUPABASE_ANON_KEY`: Supabase Anonymous Key
- `SUPABASE_SERVICE_KEY`: Supabase Service Key

Example of using these secrets in a GitHub Actions workflow:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          # Deployment commands using the Vercel token
```

## MCP Servers

The Model Context Protocol (MCP) servers access tokens from environment variables:

1. In local development, they read from the `.env` file
2. In GitHub Actions workflows, the `.env` file is created at runtime using the GitHub Secrets

## Security Best Practices

1. Never commit the `.env` file or any file containing tokens to the repository
2. Regularly rotate tokens to enhance security
3. Use the principle of least privilege when creating tokens
4. Set expiration dates on tokens when possible
5. Only grant the minimum necessary permissions to tokens

## Adding or Updating Secrets

### Local Environment

Edit your `.env` file directly with the new values.

### GitHub Secrets

To update GitHub Secrets:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret" or edit an existing secret
4. Enter the name and value of the secret

Alternatively, you can use the provided script in `mcp-servers/github_direct_test.js` to add all environment variables from your `.env` file as secrets to your GitHub repository. 