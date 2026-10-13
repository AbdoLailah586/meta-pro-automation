import { NextResponse } from 'next/server';
import { fetchOmnichannelConversations } from '@/lib/neonMetaSchema';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel') || 'all';
    const stage = searchParams.get('stage') || 'all';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const conversations = await fetchOmnichannelConversations({ channel, stage, search, limit });

    // Aggregate summary stats for marketing admins
    const stats = {
      total: conversations.length,
      unread: conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
      whatsappCount: conversations.filter(c => c.channel === 'whatsapp').length,
      facebookCount: conversations.filter(c => c.channel === 'facebook').length,
      instagramCount: conversations.filter(c => c.channel === 'instagram').length,
      newLeadsCount: conversations.filter(c => c.leadStage === 'new' || c.leadStage === 'interested').length,
    };

    return NextResponse.json({
      success: true,
      stats,
      conversations,
    });
  } catch (err) {
    console.error('Error fetching omnichannel conversations:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
