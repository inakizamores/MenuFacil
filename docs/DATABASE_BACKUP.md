# Supabase Database Backup Guide

This document explains how to set up and use the automated database backup system for MenuFácil.

## Features

The backup system provides:

- Automated daily, weekly, and monthly backups
- Configurable retention periods
- Backup verification
- Compressed backups to save space
- Detailed logging
- Platform-independent support (Windows, macOS, Linux)

## Prerequisites

The backup system requires:

1. Node.js (same version used for development)
2. Supabase CLI installed and configured
3. Access to the Supabase project (linked via `supabase login`)
4. Proper environment variables set up

## Configuration

The backup system uses environment variables for configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for admin access | Required |
| `BACKUP_DIR` | Directory to store backups | `./backups` |
| `BACKUP_RETENTION_DAILY` | Number of daily backups to keep | 7 |
| `BACKUP_RETENTION_WEEKLY` | Number of weekly backups to keep | 4 |
| `BACKUP_RETENTION_MONTHLY` | Number of monthly backups to keep | 3 |
| `BACKUP_PASSWORD` | Password to encrypt backups (if supported) | Empty |

Add these variables to your `.env` file for local development or configure them in your deployment environment.

## Running Backups Manually

To manually run a backup, use one of the following commands:

```bash
# Run automatic backup (daily, weekly, or monthly based on date)
npm run supabase:backup

# Force a specific backup type
npm run supabase:backup:daily
```

## Setting Up Automated Backups

### On Vercel

1. Set up a [Vercel Cron Job](https://vercel.com/docs/cron-jobs) in your project settings
2. Configure a daily schedule (e.g., `0 0 * * *` for midnight every day)
3. Set the endpoint to trigger the backup script
4. **Important**: Follow the secure setup instructions in [VERCEL_CRON_SETUP.md](./VERCEL_CRON_SETUP.md) to properly configure authentication

### Using GitHub Actions

Create a `.github/workflows/backup.yml` file with:

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight UTC
  workflow_dispatch: # Allow manual triggers

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run backup
        run: npm run supabase:backup
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### On Linux/macOS with Cron

1. Open your crontab: `crontab -e`
2. Add a line like:
   ```
   0 0 * * * cd /path/to/your/project && npm run supabase:backup
   ```

### On Windows with Task Scheduler

1. Open Task Scheduler
2. Create a new task to run daily
3. Action: Start a program
4. Program: `npm`
5. Arguments: `run supabase:backup`
6. Start in: `C:\path\to\your\project`

## Backup Storage

Backups are organized in the following structure:

```
backups/
  ├── daily/        # Daily backups
  ├── weekly/       # Weekly backups
  ├── monthly/      # Monthly backups
  └── backup.log    # Log file
```

### Backup Naming Convention

Backup files follow this naming pattern:

```
backup-YYYY-MM-DDThh-mm-ss.sssZ.sql[.gz|.zip]
```

Example: `backup-2024-04-12T08-30-00.000Z.sql.gz`

## Restoration Process

To restore from a backup:

1. Uncompress the backup file if needed:
   ```bash
   gunzip backup-file.sql.gz
   ```

2. Restore using Supabase CLI:
   ```bash
   supabase db reset
   psql -h localhost -p 54322 -U postgres -d postgres -f path/to/backup-file.sql
   ```

## Troubleshooting

### Common Errors

- **Connection failed**: Ensure your Supabase credentials are correct and you're linked to the right project
- **Permission denied**: Make sure the backup directory is writable
- **Compression failed**: Install gzip (on Linux/macOS) or ensure PowerShell is available (on Windows)

### Checking Logs

Check the `backups/backup.log` file for detailed information about backup operations.

## Best Practices

1. **Regularly verify backups** by attempting a restoration in a test environment
2. **Store backups in multiple locations** (e.g., cloud storage, external drives)
3. **Monitor backup logs** for any errors
4. **Document your restoration process** and practice it periodically

## Security Considerations

- Store backup credentials securely
- Ensure backup files are encrypted at rest
- Restrict access to backup files to authorized personnel only
- Consider using dedicated storage with access controls 