import { NextResponse } from 'next/server';
import { getStorage, saveStorage } from '@/lib/storage';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const storage = getStorage();
    const initialLen = storage.posts.length;

    storage.posts = storage.posts.filter((p) => p.id !== id);

    if (storage.posts.length === initialLen) {
      return NextResponse.json({ success: false, error: 'المنشور غير موجود' }, { status: 404 });
    }

    saveStorage(storage);
    return NextResponse.json({ success: true, message: 'تم حذف المنشور بنجاح' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const storage = getStorage();

    const postIndex = storage.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ success: false, error: 'المنشور غير موجود' }, { status: 404 });
    }

    storage.posts[postIndex] = {
      ...storage.posts[postIndex],
      ...body,
      id, // protect id
    };

    saveStorage(storage);
    return NextResponse.json({ success: true, post: storage.posts[postIndex] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
