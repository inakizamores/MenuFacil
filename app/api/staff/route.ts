import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createStaffMember } from '@/actions/staff';

export async function POST(request: NextRequest) {
  try {
    // Get the user making the request
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const ownerId = session.user.id;
    
    // Get the request body
    const body = await request.json();
    const { email, full_name, password, restaurantId } = body;
    
    // Validate required fields
    if (!email || !full_name || !restaurantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the staff member
    const result = await createStaffMember({
      email,
      full_name,
      password: password || '',
      restaurantId,
      role: 'restaurant_staff'
    }, ownerId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staff member created successfully',
      data: result.data
    });
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating staff member' },
      { status: 500 }
    );
  }
} 