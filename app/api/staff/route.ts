import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    // Create a supabase client
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Get the user making the request
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
    
    // First check if the restaurant belongs to the owner
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .eq('owner_id', ownerId)
      .single();
    
    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'You do not have permission to create staff for this restaurant' },
        { status: 403 }
      );
    }
    
    // Generate a temporary password if not provided
    const finalPassword = password || Math.random().toString(36).slice(-8);
    
    // Create the user in auth system
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'restaurant_staff'
      }
    });
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }
    
    const userId = authData.user.id;
    
    // Create profile with staff role
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name,
      role: 'restaurant_staff',
      parent_user_id: ownerId,
      linked_restaurant_id: restaurantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }
    
    // Add as restaurant member with viewer role
    const { error: memberError } = await supabase.from('restaurant_members').insert({
      restaurant_id: restaurantId,
      user_id: userId,
      role: 'viewer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        id: userId,
        email,
        full_name,
        restaurantId
      }
    });
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating staff member' },
      { status: 500 }
    );
  }
} 