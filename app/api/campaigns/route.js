import { NextResponse } from 'next/server';
import { getStorage, saveStorage } from '@/lib/storage';

export async function GET() {
  try {
    const storage = getStorage();
    return NextResponse.json({ success: true, campaigns: storage.campaigns });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, objective, budget, startDate, endDate, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'اسم الحملة مطلوب' }, { status: 400 });
    }

    const storage = getStorage();
    const newCamp = {
      id: `camp_${Date.now()}`,
      name: name.trim(),
      objective: objective || 'تسويق عام',
      budget: budget || 'غير محدد',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      status: 'active',
      color: color || '#0866FF',
    };

    storage.campaigns.push(newCamp);
    saveStorage(storage);

    return NextResponse.json({ success: true, campaign: newCamp });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
