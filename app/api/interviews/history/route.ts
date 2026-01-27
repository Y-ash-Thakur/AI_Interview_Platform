import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ 
      interviews: data 
    });
  } catch (error: any) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
