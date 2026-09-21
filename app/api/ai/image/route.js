import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, style = 'advertising' } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ success: false, error: 'وصف الصورة مطلوب' }, { status: 400 });
    }

    // Enhance prompt for social media marketing aesthetics
    const styles = {
      advertising: 'commercial advertising 3d rendering, luxury product showcase, vibrant volumetric neon lighting, 8k resolution, photorealistic, trending on behance',
      minimal: 'clean minimalist modern design, pastel gradient backdrop, sleek corporate branding, high end graphic design, studio lighting',
      ecommerce: 'e-commerce product banner, eye-catching discount badge, 3d floating elements, vibrant colors, premium commercial photography',
      cyber: 'cyberpunk futuristic tech style, glowing holograms, deep dark background with vivid emerald and cyan accents, ultra detailed',
    };

    const styleDesc = styles[style] || styles.advertising;
    const fullPrompt = `${prompt.trim()}, ${styleDesc}`;
    const encoded = encodeURIComponent(fullPrompt);

    // Free AI Image Generation via Pollinations Flux/SDXL engine
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: fullPrompt,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
