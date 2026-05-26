import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import getDb from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 503 });
  }

  try {
    const { city, industry, count: rawCount } = await req.json();

    if (!city || !industry || !rawCount) {
      return NextResponse.json({ error: 'city, industry, and count are required.' }, { status: 400 });
    }
    const count = Math.min(Math.max(Number(rawCount), 1), 50);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are a marketing research assistant for Full CRM Demo, a configurable CRM demo platform for local businesses. Return ONLY valid JSON arrays — no markdown, no explanation, no code fences.`;

    const userPrompt = `Research ${count} local businesses in ${city}, MO in the ${industry} industry that would benefit from digital marketing services.\n\nReturn a JSON array ONLY in this exact format:\n\n[{\n  "businessName": "",\n  "contactName": "",\n  "phone": "",\n  "email": "",\n  "website": "",\n  "facebookPage": "",\n  "address": "",\n  "city": "${city}",\n  "state": "MO",\n  "industry": "${industry}",\n  "currentWebsiteQuality": "",\n  "hasWebsite": "Yes or No",\n  "hasFacebookPage": "Yes or No",\n  "googleBusinessProfile": "Yes or No",\n  "serviceOpportunity": "",\n  "suggestedOffer": "",\n  "estimatedDealValue": 0,\n  "leadSource": "AI Research",\n  "leadStatus": "New",\n  "priority": "Warm",\n  "notes": "",\n  "painPoints": "",\n  "personalizedPitch": "",\n  "tags": []\n}]\n\nFocus on businesses with outdated/no website, low online presence. Estimated deal value $997-$5000.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    let leads: Record<string, unknown>[];
    try {
      const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim();
      leads = JSON.parse(cleaned);
      if (!Array.isArray(leads)) throw new Error('Not an array');
    } catch {
      return NextResponse.json({ error: 'AI returned unexpected format. Try again.', raw }, { status: 502 });
    }

    const sql = getDb();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const today = new Date().toISOString().split('T')[0];

    const insertedIds: number[] = [];
    for (const l of leads) {
      const leadData = {
        businessName: l.businessName || '',
        contactName: l.contactName || '',
        phone: l.phone || '',
        email: l.email || '',
        website: l.website || '',
        facebookPage: l.facebookPage || '',
        address: l.address || '',
        city: l.city || city,
        state: l.state || 'MO',
        industry: l.industry || industry,
        currentWebsiteQuality: l.currentWebsiteQuality || '',
        hasWebsite: l.hasWebsite || '',
        hasFacebookPage: l.hasFacebookPage || '',
        googleBusinessProfile: l.googleBusinessProfile || '',
        serviceOpportunity: l.serviceOpportunity || '',
        suggestedOffer: l.suggestedOffer || '',
        estimatedDealValue: typeof l.estimatedDealValue === 'number' ? l.estimatedDealValue : null,
        leadSource: 'AI Research',
        leadStatus: l.leadStatus || 'New',
        priority: l.priority || 'Warm',
        notes: l.notes || '',
        painPoints: l.painPoints || '',
        personalizedPitch: l.personalizedPitch || '',
        tags: JSON.stringify(Array.isArray(l.tags) ? l.tags : []),
        createdDate: today,
        updatedDate: ts,
      };
      const [{ id }] = await sql`INSERT INTO leads ${sql(leadData as unknown as Record<string, string | number | boolean | null>)} RETURNING id`;
      insertedIds.push(id as number);
    }

    const leadsWithIds = leads.map((l, i) => ({ ...l, id: insertedIds[i] }));
    return NextResponse.json({ count: leadsWithIds.length, leads: leadsWithIds });
  } catch (err) {
    console.error('[ai/research]', err);
    return NextResponse.json({ error: 'Research failed. Please try again.' }, { status: 500 });
  }
}