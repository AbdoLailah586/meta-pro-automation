import { NextResponse } from 'next/server';
import { searchFacebookAdLibrary } from '@/lib/adLibraryService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const country = searchParams.get('country') || 'EG';

    const data = await searchFacebookAdLibrary({ query, country });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
