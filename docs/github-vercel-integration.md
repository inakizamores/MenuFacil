# GitHub and Vercel Integration for MenúFácil

This document explains how to set up and use GitHub Actions and Vercel integration for the MenúFácil application.

## Table of Contents
- [Initial Setup](#initial-setup)
- [GitHub Secrets](#github-secrets)
- [GitHub Workflows](#github-workflows)
- [Creating Test Users](#creating-test-users)
- [Deploying to Vercel](#deploying-to-vercel)
- [Utility Scripts](#utility-scripts)

## Initial Setup

Before you can use the GitHub and Vercel integration, you need to set up the necessary secrets and configurations. The easiest way to do this is to use the setup utility script:

### For Windows:
```
cd scripts
menuutil.bat
```

### For macOS/Linux:
```
cd scripts
chmod +x menuutil.sh
./menuutil.sh
```

Select option 3 to run the GitHub secrets setup guide.

## GitHub Secrets

The following GitHub secrets are required for the workflows to function properly:

1. **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key, used for creating users and interacting with the database.
2. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL (default: 'https://aejxheybvxbwvjuyfhfh.supabase.co').
3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key, used for client-side operations.

For Vercel deployment, you also need:

1. **VERCEL_TOKEN**: A token from Vercel to authorize deployments.
2. **VERCEL_ORG_ID**: Your Vercel organization/team ID.
3. **VERCEL_PROJECT_ID**: Your Vercel project ID.

## GitHub Workflows

MenúFácil includes two main GitHub workflows:

### 1. Create Test Users (`create-test-users.yml`)
This workflow allows you to create test users in your Supabase database directly from GitHub. You can trigger it manually from the Actions tab in your GitHub repository.

Options:
- **standard**: Creates three standard test users (customer, restaurant owner, admin)
- **custom**: Creates a custom administrator user

### 2. Deploy to Vercel (`vercel-deploy.yml`)
This workflow automatically deploys your application to Vercel when you push to the main branch. You can also trigger it manually to deploy to production or create a preview deployment.

Options:
- **production**: Deploys to production
- **preview**: Creates a preview deployment

## Creating Test Users

### From GitHub Actions:
1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select the "Create Test Users" workflow
4. Click "Run workflow"
5. Choose between "standard" or "custom" user creation
6. Click "Run workflow" to start the process

### From local machine:
You can also create test users locally using the utility scripts:

#### For Windows:
```
cd scripts
menuutil.bat
```

#### For macOS/Linux:
```
cd scripts
chmod +x menuutil.sh
./menuutil.sh
```

Choose option 1 for standard test users or option 2 for a custom user.

## Deploying to Vercel

### Automatic deployment:
Every push to the main branch will trigger a deployment to Vercel production environment.

### Manual deployment:
1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select the "Deploy to Vercel" workflow
4. Click "Run workflow"
5. Choose between "production" or "preview" deployment
6. Click "Run workflow" to start the deployment

## Utility Scripts

MenúFácil includes several utility scripts to help with development and deployment:

### `menuutil.bat` (Windows) / `menuutil.sh` (macOS/Linux)
A multi-purpose utility script with the following options:
1. Create standard test users
2. Create a custom user
3. Setup GitHub secrets
4. Sync Vercel environment variables

### `setup-github-secrets.js`
Guides you through setting up the necessary GitHub secrets for your repository.

### `sync-vercel-env.js`
Helps you synchronize environment variables between your local environment and Vercel.

### `create-test-users-with-env.js`
Creates standard test users using environment variables for authentication.

### `create-user-with-env.js`
Creates a custom user with specific details using environment variables for authentication.

---

For more information on MenúFácil, please refer to the main [README.md](../README.md) file. 