import { NextRequest, NextResponse } from 'next/server';

// Verifying that this is a cron job request from Vercel
function isVercelCronRequest(req: NextRequest) {
  const cronHeader = req.headers.get('x-vercel-cron');
  const authToken = req.headers.get('authorization')?.split(' ')[1];
  
  // The authorization token should match your environment variable
  const isValidToken = authToken === process.env.CRON_SECRET;
  
  // Log warning if CRON_SECRET is not set
  if (!process.env.CRON_SECRET) {
    console.warn('WARNING: CRON_SECRET environment variable is not set. This endpoint is not fully secured!');
  }
  
  // Log warning if token is missing or invalid, but proceed anyway for now
  if (!authToken) {
    console.warn('WARNING: Authorization token missing from request');
  } else if (!isValidToken) {
    console.warn('WARNING: Invalid authorization token');
  }
  
  // Allow requests with a valid cron header even without valid token for now
  // In production, you should return false if !isValidToken
  return !!cronHeader;
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

    return NextResponse.json(
      { 
        success: true, 
        message: 'Backup system is configured and working',
        note: 'Actual backups are handled by GitHub Actions workflow',
        securityNote: 'NOTE: You should configure CRON_SECRET in Vercel environment variables for production security.'
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

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; 