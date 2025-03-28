/**
 * Supabase Database Backup Utility
 * 
 * This script automates the process of creating backups for the Supabase database.
 * It can be run manually or set up as a scheduled task/cron job.
 * 
 * Features:
 * - Full database schema and data backups
 * - Configurable backup retention
 * - Backup rotation (daily, weekly, monthly)
 * - Compression to save space
 * - Error handling and logging
 */

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdir = util.promisify(fs.mkdir);
const { createClient } = require('@supabase/supabase-js');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      params[key] = value || true;
    }
  });
  
  return params;
}

// Get command line arguments
const args = parseArgs();

// Configuration
const config = {
  backupDir: process.env.BACKUP_DIR || './backups',
  retention: {
    daily: parseInt(process.env.BACKUP_RETENTION_DAILY) || 7,     // Keep 7 daily backups
    weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY) || 4,   // Keep 4 weekly backups
    monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY) || 3  // Keep 3 monthly backups
  },
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  backupPassword: process.env.BACKUP_PASSWORD || '',
  // Override backup type if specified in command line
  backupType: args.type || null
};

// Ensure backup directories exist
async function ensureDirectories() {
  const dirs = ['daily', 'weekly', 'monthly'];
  try {
    // Create main backup directory if it doesn't exist
    await mkdir(config.backupDir, { recursive: true });
    
    // Create subdirectories for backup rotation
    for (const dir of dirs) {
      await mkdir(path.join(config.backupDir, dir), { recursive: true });
    }
    
    console.log('Backup directories created successfully');
  } catch (error) {
    console.error('Error creating backup directories:', error);
    throw error;
  }
}

// Log messages with timestamp
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  
  // Ensure backup directory exists before writing log
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }
  
  // Append to log file
  fs.appendFileSync(
    path.join(config.backupDir, 'backup.log'), 
    logMessage + '\n'
  );
}

// Create backup using Supabase CLI
async function createBackup() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const dayOfMonth = now.getDate();
  
  // Determine backup type
  let backupType = 'daily';
  
  // Use command line arg if provided, otherwise determine by date
  if (config.backupType && ['daily', 'weekly', 'monthly'].includes(config.backupType)) {
    backupType = config.backupType;
    log(`Using backup type from command line: ${backupType}`);
  } else if (dayOfMonth === 1) {
    backupType = 'monthly';
  } else if (dayOfWeek === 0) { // Sunday
    backupType = 'weekly';
  }
  
  // Set filename and path
  const filename = `backup-${timestamp}.sql`;
  const outputPath = path.join(config.backupDir, backupType, filename);
  
  try {
    log(`Starting ${backupType} backup: ${filename}`);

    // Execute Supabase CLI to dump the database
    const command = `npx supabase db dump --linked --file "${outputPath}"`;
    log(`Running command: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    // Compress the backup file
    log('Compressing backup file...');
    let compressCommand;
    
    // Check if gzip is available
    try {
      execSync('gzip --version', { stdio: 'ignore' });
      compressCommand = `gzip "${outputPath}"`;
    } catch (e) {
      // Fallback to PowerShell on Windows
      if (process.platform === 'win32') {
        compressCommand = `powershell Compress-Archive -Path "${outputPath}" -DestinationPath "${outputPath}.zip"`;
      } else {
        log('Warning: No compression tool available', true);
        return { success: true, type: backupType, path: outputPath };
      }
    }
    
    try {
      execSync(compressCommand, { stdio: 'inherit' });
      const compressedPath = process.platform === 'win32' 
        ? `${outputPath}.zip` 
        : `${outputPath}.gz`;
      log(`Backup compressed: ${compressedPath}`);
    } catch (compressError) {
      log(`Warning: Failed to compress backup: ${compressError.message}`, true);
    }
    
    log(`${backupType} backup completed successfully`);
    return { success: true, type: backupType, path: outputPath };
  } catch (error) {
    log(`Error creating backup: ${error.message}`, true);
    return { success: false, error };
  }
}

// Rotate old backups based on retention policy
async function rotateBackups() {
  try {
    log('Starting backup rotation...');
    
    for (const [type, retention] of Object.entries(config.retention)) {
      const typeDir = path.join(config.backupDir, type);
      
      // Skip if directory doesn't exist
      if (!fs.existsSync(typeDir)) {
        continue;
      }
      
      // Get all backup files in the directory
      const files = fs.readdirSync(typeDir)
        .filter(file => file.startsWith('backup-'))
        .map(file => ({ 
          name: file, 
          path: path.join(typeDir, file),
          time: fs.statSync(path.join(typeDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Sort newest to oldest
      
      // Delete old backups based on retention policy
      if (files.length > retention) {
        log(`Found ${files.length} ${type} backups, keeping ${retention}`);
        
        for (let i = retention; i < files.length; i++) {
          log(`Deleting old ${type} backup: ${files[i].name}`);
          fs.unlinkSync(files[i].path);
        }
      } else {
        log(`Found ${files.length} ${type} backups, all within retention period`);
      }
    }
    
    log('Backup rotation completed');
  } catch (error) {
    log(`Error rotating backups: ${error.message}`, true);
  }
}

// Verify backup is valid
async function verifyBackup(backupPath) {
  try {
    log(`Verifying backup: ${backupPath}`);
    
    // Check if the original file or compressed version exists
    let fileToCheck = backupPath;
    if (!fs.existsSync(fileToCheck)) {
      if (fs.existsSync(`${backupPath}.gz`)) {
        fileToCheck = `${backupPath}.gz`;
      } else if (fs.existsSync(`${backupPath}.zip`)) {
        fileToCheck = `${backupPath}.zip`;
      } else {
        log('Error: Backup file not found', true);
        return false;
      }
    }
    
    // Check file size
    const stats = fs.statSync(fileToCheck);
    if (stats.size === 0) {
      log('Error: Backup file is empty', true);
      return false;
    }
    
    log('Backup verification completed');
    return true;
  } catch (error) {
    log(`Error verifying backup: ${error.message}`, true);
    return false;
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    log('Testing Supabase connection...');
    
    // Check if supabase URL and key are set
    if (!config.supabaseUrl || !config.supabaseKey) {
      log('Error: Missing Supabase credentials in environment variables', true);
      return false;
    }
    
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log(`Error connecting to Supabase: ${error.message}`, true);
      return false;
    }
    
    log('Supabase connection successful');
    return true;
  } catch (error) {
    log(`Error testing Supabase connection: ${error.message}`, true);
    return false;
  }
}

// Main backup process
async function runBackup() {
  log('Starting database backup process');
  
  try {
    // Ensure backup directories exist
    await ensureDirectories();
    
    // Test connection to Supabase
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // Create backup
    const backupResult = await createBackup();
    if (!backupResult.success) {
      throw new Error(`Backup creation failed: ${backupResult.error.message}`);
    }
    
    // Verify backup
    const isValid = await verifyBackup(backupResult.path);
    if (!isValid) {
      throw new Error('Backup verification failed');
    }
    
    // Rotate old backups
    await rotateBackups();
    
    log('Backup process completed successfully');
  } catch (error) {
    log(`Backup process failed: ${error.message}`, true);
    process.exit(1);
  }
}

// Run the backup if this script is executed directly
if (require.main === module) {
  runBackup();
}

module.exports = {
  runBackup,
  createBackup,
  rotateBackups,
  verifyBackup,
  testSupabaseConnection
}; 