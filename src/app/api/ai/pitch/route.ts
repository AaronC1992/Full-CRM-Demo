import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 503 });
  }

  try {
    const { businessName, city, industry, hasWebsite, websiteQuality, hasFacebook, currentProblem, services, estimatedBudget } = await req.json();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const userPrompt = `You are a digital marketing sales consultant for Cue Marketing Solutions in Joplin, MO.

Business: ${businessName || '[Business Name]'}
City: ${city || 'Joplin'}
Industry: ${industry || '[Industry]'}
Has website: ${hasWebsite || 'Unknown'}${websiteQuality ? ` (Quality: ${websiteQuality})` : ''}
Has Facebook page: ${hasFacebook || 'Unknown'}
Current problems/pain points: ${currentProblem || 'Not specified'}
Services of interest: ${services || 'Not specified'}
Estimated budget: ${estimatedBudget || 'Unknown'}

Provide:
1. **Lead Score** (Hot/Warm/Cold) with brief reasoning
2. **Personalized Pitch** (2-3 sentences, conversational, for a cold call or Facebook message)
3. **Best Opening Line** for a cold call
4. **Pain Point Summary** (key problems they likely have)
5. **Recommended Service Package** with pricing
6. **Follow-Up Strategy** (timeline and approach)

Keep it practical and concise. Aaron (918 808 0074) will use this directly in his sales process.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const result = completion.choices[0]?.message?.content ?? '';
    return NextResponse.json({ result });
  } catch (err) {
    console.error('[ai/pitch]', err);
    return NextResponse.json({ error: 'Pitch generation failed. Please try again.' }, { status: 500 });
  }
}
