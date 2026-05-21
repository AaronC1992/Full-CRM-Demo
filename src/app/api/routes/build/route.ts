import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }

    const sql = getDb();
    const { config = {}, filters = {}, selectedLeadIds = [] } = await req.json();

    let leads: Record<string, unknown>[] = [];

    if (selectedLeadIds.length > 0) {
      leads = await sql`SELECT * FROM leads WHERE id = ANY(${sql.array(selectedLeadIds)}) AND do_not_visit != 1` as Record<string, unknown>[];
    } else {
      const today = new Date().toISOString().split('T')[0];
      const maxLeads = Math.min(Number(config.maxStops || 20) * 3, 60);

      leads = await sql`
        SELECT * FROM leads
        WHERE do_not_visit != 1
          AND route_eligible != 0
          ${filters.city ? sql`AND city ILIKE ${'%' + filters.city + '%'}` : sql``}
          ${filters.state ? sql`AND state = ${filters.state}` : sql``}
          ${filters.status ? sql`AND lead_status = ${filters.status}` : sql``}
          ${filters.priority ? sql`AND priority = ${filters.priority}` : sql``}
          ${filters.industry ? sql`AND industry = ${filters.industry}` : sql``}
          ${filters.serviceOpportunity ? sql`AND service_opportunity ILIKE ${'%' + filters.serviceOpportunity + '%'}` : sql``}
          ${filters.hotOnly ? sql`AND priority IN ('Hot','Urgent')` : sql``}
          ${filters.followUpDue ? sql`AND next_follow_up_date != '' AND next_follow_up_date <= ${today} AND lead_status NOT IN ('Won','Lost','Not a fit')` : sql``}
          ${filters.noWebsite ? sql`AND (has_website = 'No' OR website = '')` : sql``}
          ${filters.badWebsite ? sql`AND current_website_quality IN ('Outdated','Poor','Bad','Needs work')` : sql``}
          ${filters.customersOnly ? sql`AND lead_status = 'Won'` : sql``}
        ORDER BY priority DESC, updated_date DESC
        LIMIT ${maxLeads}
      ` as Record<string, unknown>[];
    }

    if (leads.length === 0) {
      return NextResponse.json({ error: 'No matching leads found. Try adjusting your filters.' }, { status: 400 });
    }

    const leadsWithAddress = leads.filter(l => l.address && (l.city || l.state));
    const leadsWithoutAddress = leads.filter(l => !l.address || (!l.city && !l.state));

    const geocoded: Record<number, { lat: number; lng: number; placeId: string }> = {};
    // Geocoding is skipped during AI build to avoid timeout.
    // Leads are geocoded lazily via /api/leads/geocode or during Map optimization.

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

    const systemPrompt = `You are a sales route planner for Cue Marketing Solutions, a digital marketing agency in Joplin, MO that sells websites, local SEO, social media management, and custom CRMs to small local businesses.\n\nAnalyze the provided leads and create an optimized visit plan. Return ONLY valid JSON — no markdown, no explanation.`;

    const userPrompt = `Route goal: ${routeGoal}\nMax stops: ${maxStops}\nStart time: ${config.startTime || '9:00 AM'}\nEnd time: ${config.endTime || '5:00 PM'}\nDate: ${config.routeDate || 'today'}\n\nLeads to evaluate (${leadsForAI.length} total):\n${JSON.stringify(leadsForAI, null, 2)}\n\nReturn a JSON object exactly matching this structure:\n{\n  "routeName": "string - descriptive name for this route",\n  "routeGoal": "string - refined route goal",\n  "summary": "string - 2-3 sentence summary of the route strategy",\n  "recommendedStops": [\n    {\n      "leadId": "string",\n      "businessName": "string",\n      "visitPriority": number (1 = highest),\n      "routeScore": number (0-100),\n      "visitReason": "string",\n      "talkingPoints": ["string"],\n      "recommendedPitch": "string",\n      "suggestedOffer": "string",\n      "leaveBehindSuggestion": "string",\n      "followUpAction": "string",\n      "estimatedVisitMinutes": number,\n      "skipReason": ""\n    }\n  ],\n  "skippedLeads": [\n    { "leadId": "string", "businessName": "string", "reason": "string" }\n  ],\n  "routeStrategy": "string",\n  "followUpPlan": "string"\n}\n\nOnly include the top ${maxStops} leads in recommendedStops. Move the rest to skippedLeads.`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 6000,
    });

    let aiPlan: Record<string, unknown>;
    try {
      let raw = aiResponse.choices[0]?.message?.content || '{}';
      raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      aiPlan = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned an invalid response. Please try again.' }, { status: 500 });
    }

    const leadMap: Record<string, Record<string, unknown>> = {};
    for (const l of leadsWithAddress) leadMap[String(l.id)] = l;

    const recommendedStops = (Array.isArray(aiPlan.recommendedStops) ? aiPlan.recommendedStops as Record<string, unknown>[] : []).map((s, i) => {
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