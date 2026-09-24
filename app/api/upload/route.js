import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم تحديد أي ملف للرفع' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean filename with timestamp
    const ext = path.extname(file.name) || '.png';
    const cleanBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `ad_${Date.now()}_${cleanBaseName}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileName,
      size: buffer.length,
      message: 'تم رفع الصورة بنجاح!',
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message || 'فشل رفع الملف' }, { status: 500 });
  }
}
