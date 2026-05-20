import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import getDb from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 503 });
  }

  try {
    const { city, industry, count } = await req.json();

    if (!city || !industry || !count) {
      return NextResponse.json({ error: 'city, industry, and count are required.' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are a marketing research assistant for Cue Marketing Solutions, a digital marketing agency in Joplin, MO (service area: Joplin, Webb City, Carthage, Neosho, Carl Junction, Pittsburg MO). Return ONLY valid JSON arrays — no markdown, no explanation, no code fences.`;

    const userPrompt = `Research ${count} local businesses in ${city}, MO in the ${industry} industry that would benefit from digital marketing services.

Return a JSON array ONLY in this exact format:

[{
  "businessName": "",
  "contactName": "",
  "phone": "",
  "email": "",
  "website": "",
  "facebookPage": "",
  "address": "",
  "city": "${city}",
  "state": "MO",
  "industry": "${industry}",
  "currentWebsiteQuality": "",
  "hasWebsite": "Yes or No",
  "hasFacebookPage": "Yes or No",
  "googleBusinessProfile": "Yes or No",
  "serviceOpportunity": "",
  "suggestedOffer": "",
  "estimatedDealValue": 0,
  "leadSource": "AI Research",
  "leadStatus": "New",
  "priority": "Warm",
  "notes": "",
  "painPoints": "",
  "personalizedPitch": "",
  "tags": []
}]

Focus on businesses with outdated/no website, low online presence. Estimated deal value $997–$5000.`;

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
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim();
      leads = JSON.parse(cleaned);
      if (!Array.isArray(leads)) throw new Error('Not an array');
    } catch {
      return NextResponse.json({ error: 'AI returned unexpected format. Try again.', raw }, { status: 502 });
    }

    // Save each lead to the database
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO leads (
        businessName, contactName, phone, email, website, facebookPage, address, city, state,
        industry, currentWebsiteQuality, hasWebsite, hasFacebookPage, googleBusinessProfile,
        serviceOpportunity, suggestedOffer, estimatedDealValue, leadSource, leadStatus, priority,
        notes, painPoints, personalizedPitch, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows: Record<string, unknown>[]) => {
      const ids: number[] = [];
      for (const l of rows) {
        const result = stmt.run(
          l.businessName || '', l.contactName || '', l.phone || '',
          l.email || '', l.website || '', l.facebookPage || '',
          l.address || '', l.city || city, l.state || 'MO',
          l.industry || industry, l.currentWebsiteQuality || '',
          l.hasWebsite || '', l.hasFacebookPage || '', l.googleBusinessProfile || '',
          l.serviceOpportunity || '', l.suggestedOffer || '',
          typeof l.estimatedDealValue === 'number' ? l.estimatedDealValue : null,
          'AI Research', l.leadStatus || 'New', l.priority || 'Warm',
          l.notes || '', l.painPoints || '', l.personalizedPitch || '',
          JSON.stringify(Array.isArray(l.tags) ? l.tags : [])
        );
        ids.push(Number(result.lastInsertRowid));
      }
      return ids;
    });

    const insertedIds = insertMany(leads);
    const leadsWithIds = leads.map((l, i) => ({ ...l, id: insertedIds[i] }));

    return NextResponse.json({ count: leadsWithIds.length, leads: leadsWithIds });
  } catch (err) {
    console.error('[ai/research]', err);
    return NextResponse.json({ error: 'Research failed. Please try again.' }, { status: 500 });
  }
}
