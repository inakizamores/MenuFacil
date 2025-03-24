import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const staffId = params.id;
    
    // First check if this staff member belongs to the owner
    const { data: staff, error: staffError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', staffId)
      .eq('parent_user_id', ownerId)
      .single();
    
    if (staffError || !staff) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this staff member' },
        { status: 403 }
      );
    }
    
    // Delete from auth system
    const { error: authError } = await supabase.auth.admin.deleteUser(staffId);
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      );
    }
    
    // The profile will be automatically deleted due to CASCADE
    
    return NextResponse.json(
      { success: true, message: 'Staff member deleted successfully' }
    );
  } catch (error: any) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: error.message || 'Error deleting staff member' },
      { status: 500 }
    );
  }
} 