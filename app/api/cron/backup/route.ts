import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import { createClient } from '@/lib/supabase/server';

// Convert exec to Promise
const execAsync = util.promisify(exec);

// Verifying that this is a cron job request from Vercel
function isVercelCronRequest(req: NextRequest) {
  const cronHeader = req.headers.get('x-vercel-cron');
  const authToken = req.headers.get('authorization')?.split(' ')[1];
  
  // The authorization token should match your environment variable
  const isValidToken = authToken === process.env.CRON_SECRET;
  
  return !!cronHeader && isValidToken;
}

export async function GET(req: NextRequest) {
  try {
    // Only allow this endpoint to be called by Vercel Cron
    if (!isVercelCronRequest(req)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get backup type from query parameter or default to 'daily'
    const { searchParams } = new URL(req.url);
    const backupType = searchParams.get('type') || 'daily';
    
    // Check if we have Supabase credentials
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }
    
    // Test connection to Supabase
    console.log('Testing Supabase connection...');
    const supabase = createClient();
    const { data: connectionTest, error: connectionError } = await supabase.from('profiles').select('count(*)', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('Supabase connection error:', connectionError.message);
      return NextResponse.json(
        { error: 'Failed to connect to Supabase', details: connectionError.message },
        { status: 500 }
      );
    }
    
    console.log('Supabase connection successful');
    
    // If we're running in Vercel's serverless environment, we can't directly run
    // the backup script due to Node.js execution environment limitations.
    // Instead, we'll log the backup intent and then use webhooks to trigger
    // the GitHub Actions workflow for backup
    
    // Get the GitHub repository from env or fallback
    const githubRepo = process.env.GITHUB_REPOSITORY || 'inakizamores/MenuFacil';
    
    // Create a log record of the backup attempt
    const { data: logRecord, error: logError } = await supabase
      .from('backup_logs')
      .insert({
        type: backupType,
        status: 'initiated',
        details: 'Backup requested from Vercel cron job',
        created_by: 'vercel-cron'
      })
      .select('id')
      .single();
    
    if (logError) {
      console.warn('Could not log backup request:', logError.message);
    }
    
    // If we have a GitHub token, trigger the workflow
    if (process.env.GITHUB_TOKEN) {
      try {
        console.log('Triggering GitHub Actions backup workflow...');
        
        // Call GitHub API to trigger the workflow dispatch event
        const response = await fetch(
          `https://api.github.com/repos/${githubRepo}/actions/workflows/database-backup.yml/dispatches`,
          {
            method: 'POST',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${process.env.GITHUB_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ref: 'main',
              inputs: {
                backup_type: backupType,
                triggered_by: 'vercel-cron',
                log_id: logRecord?.id || 'unknown'
              }
            })
          }
        );
        
        if (response.ok) {
          console.log('GitHub Actions workflow triggered successfully');
          return NextResponse.json(
            { 
              success: true, 
              message: 'Backup initiated via GitHub Actions',
              backupType,
              logId: logRecord?.id
            },
            { status: 200 }
          );
        } else {
          const responseText = await response.text();
          throw new Error(`GitHub API responded with ${response.status}: ${responseText}`);
        }
      } catch (error: any) {
        console.error('Error triggering GitHub workflow:', error.message);
        return NextResponse.json(
          { 
            error: 'Failed to trigger backup workflow', 
            details: error.message 
          },
          { status: 500 }
        );
      }
    }
    
    // Fallback message if we can't trigger backup directly
    return NextResponse.json(
      { 
        success: true, 
        message: 'Backup request logged, but requires manual intervention',
        backupType 
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error in backup endpoint:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// This route will be triggered by Vercel Cron
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 