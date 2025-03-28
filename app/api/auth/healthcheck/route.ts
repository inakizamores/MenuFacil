import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Health check for auth system
 * Not authenticated, suitable for client-side status checks
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Basic connectivity check with Supabase
    const supabase = await createClient();
    
    // Simple query to verify connection
    const start = Date.now();
    await supabase.from('_pgrst_reserved_reaction').select('*').limit(1).maybeSingle();
    const latency = Date.now() - start;
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Auth system is operational',
      timestamp: new Date().toISOString(),
      latency: `${latency}ms`,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    });
  } catch (error) {
    console.error('Auth health check failed:', error);
    
    return NextResponse.json({
      status: 'degraded',
      message: 'Auth system experiencing issues',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 