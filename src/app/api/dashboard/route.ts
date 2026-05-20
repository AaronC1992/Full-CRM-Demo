import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const today = new Date().toISOString().split('T')[0];

    const [{ c: totalLeads }] = await sql`SELECT COUNT(*) as c FROM leads`;
    const [{ c: newLeads }] = await sql`SELECT COUNT(*) as c FROM leads WHERE lead_status = 'New'`;
    const [{ c: contactedLeads }] = await sql`SELECT COUNT(*) as c FROM leads WHERE lead_status IN ('Contacted','No answer','Interested','Follow up needed','Meeting scheduled','Proposal sent')`;
    const [{ c: interestedLeads }] = await sql`SELECT COUNT(*) as c FROM leads WHERE lead_status = 'Interested'`;
    const [{ c: demoSentLeads }] = await sql`SELECT COUNT(*) as c FROM leads WHERE lead_status = 'Demo website sent'`;
    const [{ c: followUpDueToday }] = await sql`SELECT COUNT(*) as c FROM leads WHERE next_follow_up_date != '' AND next_follow_up_date <= ${today} AND lead_status NOT IN ('Won','Lost','Not a fit')`;
    const [{ c: wonDeals }] = await sql`SELECT COUNT(*) as c FROM leads WHERE lead_status = 'Won'`;
    const [{ c: lostDeals }] = await sql`SELECT COUNT(*) as c FROM leads WHERE lead_status = 'Lost'`;
    const thisMonth = today.substring(0, 7);
    const [{ v: monthlyVal }] = await sql`SELECT COALESCE(SUM(estimated_deal_value), 0) as v FROM leads WHERE lead_status NOT IN ('Lost','Not a fit') AND estimated_deal_value > 0 AND created_date LIKE ${`${thisMonth}%`}`;
    const [{ v: wonVal }] = await sql`SELECT COALESCE(SUM(estimated_deal_value), 0) as v FROM leads WHERE lead_status = 'Won' AND estimated_deal_value > 0 AND updated_date LIKE ${`${thisMonth}%`}`;

    const hotLeads = await sql`SELECT * FROM leads WHERE priority IN ('Hot','Urgent') AND lead_status NOT IN ('Won','Lost','Not a fit') ORDER BY priority DESC, updated_date DESC LIMIT 5`;
    const recentActivity = await sql`SELECT a.*, l.business_name FROM activities a LEFT JOIN leads l ON a.lead_id = l.id ORDER BY a.created_date DESC LIMIT 10`;
    const upcomingFollowUps = await sql`SELECT * FROM leads WHERE next_follow_up_date != '' AND next_follow_up_date >= ${today} AND lead_status NOT IN ('Won','Lost','Not a fit') ORDER BY next_follow_up_date ASC LIMIT 8`;

    let routesToday = 0;
    let stopsToday = 0;
    let completedRoutesThisMonth = 0;
    let stopsCompletedThisMonth = 0;
    try {
      const [rt] = await sql`SELECT COUNT(*) as c FROM route_plans WHERE route_date = ${today} AND status NOT IN ('Archived')`;
      routesToday = Number(rt.c);
      const [st] = await sql`SELECT COALESCE(SUM(total_stops),0) as c FROM route_plans WHERE route_date = ${today}`;
      stopsToday = Number(st.c);
      const [cr] = await sql`SELECT COUNT(*) as c FROM route_plans WHERE status = 'Completed' AND route_date LIKE ${`${thisMonth}%`}`;
      completedRoutesThisMonth = Number(cr.c);
      const [sc] = await sql`SELECT COUNT(*) as c FROM route_stops WHERE visit_completed = 1 AND visit_completed_at LIKE ${`${thisMonth}%`}`;
      stopsCompletedThisMonth = Number(sc.c);
    } catch { /* route tables may not exist yet */ }

    return NextResponse.json({
      totalLeads: Number(totalLeads), newLeads: Number(newLeads),
      contactedLeads: Number(contactedLeads), interestedLeads: Number(interestedLeads),
      demoSentLeads: Number(demoSentLeads), followUpDueToday: Number(followUpDueToday),
      wonDeals: Number(wonDeals), lostDeals: Number(lostDeals),
      monthlyEstimatedValue: Number(monthlyVal),
      wonThisMonthValue: Number(wonVal),
      hotLeads, recentActivity, upcomingFollowUps,
      routesToday, stopsToday, completedRoutesThisMonth, stopsCompletedThisMonth,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}