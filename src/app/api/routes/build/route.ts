import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import OpenAI from 'openai';

// POST /api/routes/build
// Body: { config, filters, selectedLeadIds }
export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }

    const db = getDb();
    const { config = {}, filters = {}, selectedLeadIds = [] } = await req.json();

    // ── 1. Fetch leads ──────────────────────────────────────────────────────────
    let leads: Record<string, unknown>[] = [];

    if (selectedLeadIds.length > 0) {
      const placeholders = selectedLeadIds.map(() => '?').join(',');
      leads = db.prepare(`SELECT * FROM leads WHERE id IN (${placeholders}) AND doNotVisit != 1`).all(...selectedLeadIds) as Record<string, unknown>[];
    } else {
      let query = "SELECT * FROM leads WHERE doNotVisit != 1 AND routeEligible != 0";
      const params: unknown[] = [];

      if (filters.city) { query += " AND city LIKE ?"; params.push(`%${filters.city}%`); }
      if (filters.state) { query += " AND state = ?"; params.push(filters.state); }
      if (filters.status) { query += " AND leadStatus = ?"; params.push(filters.status); }
      if (filters.priority) { query += " AND priority = ?"; params.push(filters.priority); }
      if (filters.industry) { query += " AND industry = ?"; params.push(filters.industry); }
      if (filters.serviceOpportunity) { query += " AND serviceOpportunity LIKE ?"; params.push(`%${filters.serviceOpportunity}%`); }
      if (filters.hotOnly) { query += " AND priority IN ('Hot','Urgent')"; }
      if (filters.followUpDue) {
        const today = new Date().toISOString().split('T')[0];
        query += " AND DATE(nextFollowUpDate) <= DATE(?) AND leadStatus NOT IN ('Won','Lost','Not a fit')";
        params.push(today);
      }
      if (filters.noWebsite) { query += " AND (hasWebsite = 'No' OR website = '')"; }
      if (filters.badWebsite) { query += " AND currentWebsiteQuality IN ('Outdated','Poor','Bad','Needs work')"; }
      if (filters.customersOnly) { query += " AND leadStatus = 'Won'"; }

      const maxLeads = Math.min(Number(config.maxStops || 20) * 3, 60);
      query += ` ORDER BY priority DESC, updatedDate DESC LIMIT ${maxLeads}`;
      leads = db.prepare(query).all(...params) as Record<string, unknown>[];
    }

    if (leads.length === 0) {
      return NextResponse.json({ error: 'No matching leads found. Try adjusting your filters.' }, { status: 400 });
    }

    // ── 2. Check for missing addresses ─────────────────────────────────────────
    const leadsWithAddress = leads.filter(l => l.address && (l.city || l.state));
    const leadsWithoutAddress = leads.filter(l => !l.address || (!l.city && !l.state));

    // ── 3. Geocode leads missing lat/lng (if Google Maps API key available) ─────
    const geocoded: Record<number, { lat: number; lng: number; placeId: string }> = {};
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const toGeocode = leadsWithAddress.filter(l => !l.latitude || !l.longitude).slice(0, 25);
      for (const lead of toGeocode) {
        try {
          const addressStr = [lead.address, lead.city, lead.state, 'USA'].filter(Boolean).join(', ');
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressStr)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === 'OK' && data.results[0]) {
            const { lat, lng } = data.results[0].geometry.location;
            const placeId = data.results[0].place_id || '';
            geocoded[lead.id as number] = { lat, lng, placeId };
            db.prepare(`UPDATE leads SET latitude=?, longitude=?, placeId=?, updatedDate=datetime('now','localtime') WHERE id=?`)
              .run(lat, lng, placeId, lead.id);
            lead.latitude = lat;
            lead.longitude = lng;
            lead.placeId = placeId;
          }
        } catch { /* geocoding failed for this lead, skip */ }
      }
    }

    // ── 4. Send to OpenAI for scoring & route planning ─────────────────────────
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const leadsForAI = leadsWithAddress.slice(0, 30).map(l => ({
      leadId: String(l.id),
      businessName: l.businessName,
      city: l.city,
      industry: l.industry,
      leadStatus: l.leadStatus,
      priority: l.priority,
      hasWebsite: l.hasWebsite,
      currentWebsiteQuality: l.currentWebsiteQuality,
      serviceOpportunity: l.serviceOpportunity,
      estimatedDealValue: l.estimatedDealValue,
      lastContactedDate: l.lastContactedDate,
      nextFollowUpDate: l.nextFollowUpDate,
      painPoints: l.painPoints,
      notes: l.notes,
      inPersonVisitStatus: l.inPersonVisitStatus,
      lastVisitedDate: l.lastVisitedDate,
    }));

    const maxStops = Number(config.maxStops || 10);
    const routeGoal = config.routeGoal || 'Visit local businesses and introduce Cue Marketing Solutions services';

    const systemPrompt = `You are a sales route planner for Cue Marketing Solutions, a digital marketing agency in Joplin, MO that sells websites, local SEO, social media management, and custom CRMs to small local businesses.

Analyze the provided leads and create an optimized visit plan. Return ONLY valid JSON — no markdown, no explanation.`;

    const userPrompt = `Route goal: ${routeGoal}
Max stops: ${maxStops}
Start time: ${config.startTime || '9:00 AM'}
End time: ${config.endTime || '5:00 PM'}
Date: ${config.routeDate || 'today'}

Leads to evaluate (${leadsForAI.length} total):
${JSON.stringify(leadsForAI, null, 2)}

Return a JSON object exactly matching this structure:
{
  "routeName": "string - descriptive name for this route",
  "routeGoal": "string - refined route goal",
  "summary": "string - 2-3 sentence summary of the route strategy",
  "recommendedStops": [
    {
      "leadId": "string",
      "businessName": "string",
      "visitPriority": number (1 = highest),
      "routeScore": number (0-100),
      "visitReason": "string - why visit this business today",
      "talkingPoints": ["string", "string"],
      "recommendedPitch": "string - 1-2 sentence personalized pitch",
      "suggestedOffer": "string - specific service/package to pitch",
      "leaveBehindSuggestion": "string - what to leave at the door",
      "followUpAction": "string - recommended next action",
      "estimatedVisitMinutes": number,
      "skipReason": ""
    }
  ],
  "skippedLeads": [
    { "leadId": "string", "businessName": "string", "reason": "string" }
  ],
  "routeStrategy": "string - overall approach for the day",
  "followUpPlan": "string - summary of recommended follow-up actions after the route"
}

Only include the top ${maxStops} leads in recommendedStops. Move the rest to skippedLeads.`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    let aiPlan: Record<string, unknown>;
    try {
      let raw = aiResponse.choices[0]?.message?.content || '{}';
      raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      aiPlan = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned an invalid response. Please try again.' }, { status: 500 });
    }

    // ── 5. Merge AI plan with lead data ─────────────────────────────────────────
    const leadMap: Record<string, Record<string, unknown>> = {};
    for (const l of leadsWithAddress) leadMap[String(l.id)] = l;

    const recommendedStops = (aiPlan.recommendedStops as Record<string, unknown>[] || []).map((s, i) => {
      const lead = leadMap[s.leadId as string] || {};
      return {
        leadId: lead.id ?? null,
        businessName: s.businessName || lead.businessName,
        contactName: lead.contactName ?? '',
        phone: lead.phone ?? '',
        email: lead.email ?? '',
        website: lead.website ?? '',
        facebookPage: lead.facebookPage ?? '',
        address: lead.address ?? '',
        city: lead.city ?? '',
        state: lead.state ?? '',
        latitude: (geocoded[lead.id as number]?.lat) ?? lead.latitude ?? null,
        longitude: (geocoded[lead.id as number]?.lng) ?? lead.longitude ?? null,
        stopOrder: i + 1,
        priority: lead.priority ?? 'Warm',
        leadStatus: lead.leadStatus ?? 'New',
        industry: lead.industry ?? '',
        serviceOpportunity: lead.serviceOpportunity ?? '',
        suggestedOffer: s.suggestedOffer ?? '',
        estimatedDealValue: lead.estimatedDealValue ?? null,
        visitReason: s.visitReason ?? '',
        talkingPoints: Array.isArray(s.talkingPoints) ? s.talkingPoints : [],
        recommendedPitch: s.recommendedPitch ?? '',
        leaveBehindSuggestion: s.leaveBehindSuggestion ?? '',
        followUpAction: s.followUpAction ?? '',
        estimatedVisitMinutes: s.estimatedVisitMinutes ?? 15,
        arrivalWindow: '',
        notes: '',
        routeScore: s.routeScore ?? null,
      };
    });

    return NextResponse.json({
      aiPlan,
      stops: recommendedStops,
      skippedLeads: aiPlan.skippedLeads || [],
      leadsWithoutAddress: leadsWithoutAddress.map(l => ({ id: l.id, businessName: l.businessName, city: l.city })),
      geocodedCount: Object.keys(geocoded).length,
      totalLeadsEvaluated: leadsForAI.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Route build failed. Please try again.' }, { status: 500 });
  }
}
