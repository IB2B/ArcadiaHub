import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/database/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (q.length < 1) {
    return NextResponse.json([]);
  }

  const safe = q.replace(/[.,()\[\]]/g, '');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, contact_first_name, contact_last_name, company_name, logo_url')
    .or(
      `company_name.ilike.%${safe}%,contact_first_name.ilike.%${safe}%,contact_last_name.ilike.%${safe}%`
    )
    .eq('is_active', true)
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
