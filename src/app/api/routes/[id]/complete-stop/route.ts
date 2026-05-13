import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// POST /api/routes/[id]/complete-stop
// Body: { stopId, spokeTo, visitOutcome, interestLevel, followUpDate, notes, nextAction }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const routeId = Number(params.id);
    const {
      stopId, spokeTo = '', visitOutcome = '', interestLevel = '',
      followUpDate = '', notes = '', nextAction = '',
    } = await req.json();

    if (!stopId) return NextResponse.json({ error: 'stopId is required' }, { status: 400 });

    // Update the stop
    db.prepare(`
      UPDATE route_stops SET
        spokeTo=?, visitOutcome=?, interestLevel=?, followUpDate=?, notes=?,
        nextAction=?, visitCompleted=1, visitCompletedAt=datetime('now','localtime'),
        updatedAt=datetime('now','localtime')
      WHERE id=? AND routePlanId=?
    `).run(spokeTo, visitOutcome, interestLevel, followUpDate, notes, nextAction, stopId, routeId);

    const stop = db.prepare('SELECT * FROM route_stops WHERE id=?').get(stopId) as Record<string, unknown> | null;
    if (!stop) return NextResponse.json({ error: 'Stop not found' }, { status: 404 });

    const leadId = stop.leadId as number | null;

    // Map interest level to lead status
    const statusMap: Record<string, string> = {
      'Very hot': 'Interested',
      'High': 'Interested',
      'Medium': 'Follow up needed',
      'Low': 'Follow up needed',
      'Not interested': 'Not a fit',
    };

    // Map next action to visit status
    const visitStatusMap: Record<string, string> = {
      'spoke with owner': 'Spoke with owner',
      'spoke with employee': 'Spoke with employee',
    };

    let inPersonStatus = 'Visited';
    if (spokeTo.toLowerCase().includes('owner')) inPersonStatus = 'Spoke with owner';
    else if (spokeTo.toLowerCase().includes('employee') || spokeTo.toLowerCase().includes('manager')) inPersonStatus = 'Spoke with employee';
    else if (!spokeTo && !visitOutcome) inPersonStatus = 'No one available';
    else if (visitOutcome.toLowerCase().includes('card')) inPersonStatus = 'Left card';
    else if (followUpDate) inPersonStatus = 'Follow up scheduled';
    void visitStatusMap;

    if (leadId) {
      // Update lead
      const newStatus = statusMap[interestLevel] || 'Follow up needed';
      db.prepare(`
        UPDATE leads SET
          leadStatus=?, lastContactedDate=date('now','localtime'),
          inPersonVisitStatus=?, lastVisitedDate=date('now','localtime'),
          nextFollowUpDate=?, visitNotes=?,
          updatedDate=datetime('now','localtime')
        WHERE id=?
      `).run(newStatus, inPersonStatus, followUpDate || '', notes, leadId);

      // Log activity
      const activityDesc = [
        `In-person visit completed.`,
        spokeTo ? `Spoke with: ${spokeTo}.` : '',
        visitOutcome ? `Outcome: ${visitOutcome}.` : '',
        interestLevel ? `Interest level: ${interestLevel}.` : '',
        followUpDate ? `Follow-up: ${followUpDate}.` : '',
        notes ? `Notes: ${notes}` : '',
      ].filter(Boolean).join(' ');

      db.prepare(`INSERT INTO activities (leadId, type, description) VALUES (?, 'note', ?)`).run(leadId, activityDesc);

      // Create follow-up task if needed
      if (followUpDate && nextAction && nextAction !== 'No action') {
        const taskTypeMap: Record<string, string> = {
          'Call back': 'Call',
          'Email': 'Email',
          'Send demo': 'Send demo',
          'Build demo website': 'Build demo',
          'Send proposal': 'Proposal',
          'Schedule meeting': 'Meeting',
        };
        const taskType = taskTypeMap[nextAction] || 'Follow up';
        const taskTitle = `${nextAction} — ${stop.businessName}`;
        db.prepare(`
          INSERT INTO tasks (title, leadId, dueDate, taskType, priority, status, notes)
          VALUES (?, ?, ?, ?, 'High', 'pending', ?)
        `).run(taskTitle, leadId, followUpDate, taskType, `After in-person visit. ${notes}`);
      }
    }

    return NextResponse.json({ success: true, inPersonStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to complete stop' }, { status: 500 });
  }
}
