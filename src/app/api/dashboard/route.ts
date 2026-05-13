import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const totalLeads = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as { c: number }).c;
    const newLeads = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE leadStatus = 'New'").get() as { c: number }).c;
    const contactedLeads = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE leadStatus IN ('Contacted','No answer','Interested','Follow up needed','Meeting scheduled','Proposal sent')").get() as { c: number }).c;
    const interestedLeads = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE leadStatus = 'Interested'").get() as { c: number }).c;
    const demoSentLeads = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE leadStatus = 'Demo website sent'").get() as { c: number }).c;
    const followUpDueToday = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE DATE(nextFollowUpDate) <= DATE(?) AND leadStatus NOT IN ('Won','Lost','Not a fit')").get(today) as { c: number }).c;
    const wonDeals = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE leadStatus = 'Won'").get() as { c: number }).c;
    const lostDeals = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE leadStatus = 'Lost'").get() as { c: number }).c;
    const monthlyVal = (db.prepare("SELECT COALESCE(SUM(estimatedDealValue), 0) as v FROM leads WHERE leadStatus NOT IN ('Lost','Not a fit') AND estimatedDealValue > 0").get() as { v: number }).v;

    const hotLeads = db.prepare("SELECT * FROM leads WHERE priority IN ('Hot','Urgent') AND leadStatus NOT IN ('Won','Lost','Not a fit') ORDER BY priority DESC, updatedDate DESC LIMIT 5").all();
    const recentActivity = db.prepare('SELECT a.*, l.businessName FROM activities a LEFT JOIN leads l ON a.leadId = l.id ORDER BY a.createdDate DESC LIMIT 10').all();
    const upcomingFollowUps = db.prepare("SELECT * FROM leads WHERE nextFollowUpDate != '' AND DATE(nextFollowUpDate) >= DATE(?) AND leadStatus NOT IN ('Won','Lost','Not a fit') ORDER BY nextFollowUpDate ASC LIMIT 8").all(today);

    // Route stats
    let routesToday = 0;
    let stopsToday = 0;
    let completedRoutesThisMonth = 0;
    let stopsCompletedThisMonth = 0;
    try {
      routesToday = (db.prepare("SELECT COUNT(*) as c FROM route_plans WHERE routeDate = ? AND status NOT IN ('Archived')").get(today) as { c: number }).c;
      const stopsRow = db.prepare("SELECT COALESCE(SUM(totalStops),0) as c FROM route_plans WHERE routeDate = ?").get(today) as { c: number };
      stopsToday = stopsRow.c;
      const thisMonth = today.substring(0, 7);
      completedRoutesThisMonth = (db.prepare("SELECT COUNT(*) as c FROM route_plans WHERE status='Completed' AND routeDate LIKE ?").get(`${thisMonth}%`) as { c: number }).c;
      stopsCompletedThisMonth = (db.prepare("SELECT COUNT(*) as c FROM route_stops WHERE visitCompleted=1 AND DATE(visitCompletedAt) LIKE ?").get(`${thisMonth}%`) as { c: number }).c;
    } catch { /* route tables may not exist yet */ }

    return NextResponse.json({
      totalLeads, newLeads, contactedLeads, interestedLeads, demoSentLeads,
      followUpDueToday, wonDeals, lostDeals, monthlyEstimatedValue: monthlyVal,
      hotLeads, recentActivity, upcomingFollowUps,
      routesToday, stopsToday, completedRoutesThisMonth, stopsCompletedThisMonth,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
