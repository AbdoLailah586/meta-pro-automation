import { NextResponse } from 'next/server';
import { updateLeadMetadata } from '@/lib/neonMetaSchema';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { conversationId, leadStage, assignedAdmin, notes } = body;

    if (!conversationId) {
      return NextResponse.json({ success: false, error: 'معرف المحادثة مطلوب' }, { status: 400 });
    }

    const updated = await updateLeadMetadata(conversationId, { leadStage, assignedAdmin, notes });
    return NextResponse.json({
      success: updated,
      message: 'تم تحديث بيانات العميل بنجاح في السجل الموحد.',
    });
  } catch (err) {
    console.error('Error updating lead metadata:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
