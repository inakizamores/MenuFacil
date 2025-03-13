/**
 * Admin users API route
 * Uses the service role key to access admin-level functionality
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, createUser, listUsers } from '@/lib/supabase-admin';

// List all users - for admin panel
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');
    
    // Validate request with additional key verification
    if (!secretKey || secretKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // List all users
    const data = await listUsers();
    
    return NextResponse.json({ users: data.users });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Create a new user - for admin panel
export async function POST(request) {
  try {
    // This uses the service role key via supabase-admin
    const body = await request.json();
    const { email, password, metadata } = body;
    
    // Validate request data
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Create the user
    const data = await createUser({ email, password, metadata });
    
    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 