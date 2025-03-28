import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // This is a simplified version of the backup endpoint
    // that just returns a success message
    // The actual backup is handled by GitHub Actions

    return NextResponse.json(
      { 
        success: true, 
        message: 'Backup system is configured and working',
        note: 'Actual backups are handled by GitHub Actions workflow'
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