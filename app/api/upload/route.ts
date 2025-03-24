import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client
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
    
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get folder and file name from query params
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName') || `${Date.now()}-${file.name}`;
    const folder = searchParams.get('folder') || 'uploads';
    
    // Check user authentication
    const {
      data: { session }
    } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Read the file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Define storage path
    const storagePath = `${folder}/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('menufacil')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('menufacil')
      .getPublicUrl(storagePath);
    
    return NextResponse.json({ 
      url: publicUrl,
      path: storagePath,
      size: file.size,
      type: file.type
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 