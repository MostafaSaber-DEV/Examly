import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a simple secret for demo
    const secret = Math.random().toString(36).substring(2, 15);

    return NextResponse.json({ secret });
  } catch (error) {
    console.error('MFA generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate MFA secret' },
      { status: 500 }
    );
  }
}
