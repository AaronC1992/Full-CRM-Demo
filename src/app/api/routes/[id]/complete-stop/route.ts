import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const routeId = Number(params.id);
    const {
      stopId, spokeTo = '', visitOutcome = '', interestLevel = '',
      followUpDate = '', notes = '', nextAction = '',
    } = await req.json();

    if (!stopId) return NextResponse.json({ error: 'stopId is required' }, { status: 400 });

    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const today = new Date().toISOString().split('T')[0];

    await sql`
      UPDATE route_stops SET
        spoke_to = ${spokeTo},
        visit_outcome = ${visitOutcome},
        interest_level = ${interestLevel},
        follow_up_date = ${followUpDate},
        notes = ${notes},
        next_action = ${nextAction},
        visit_completed = 1,
        visit_completed_at = ${ts},
        updated_at = ${ts}
      WHERE id = ${stopId} AND route_plan_id = ${routeId}
    `;

    const [stop] = await sql`SELECT * FROM route_stops WHERE id = ${stopId}` as Record<string, unknown>[];
    if (!stop) return NextResponse.json({ error: 'Stop not found' }, { status: 404 });

    const leadId = stop.leadId as number | null;

    const statusMap: Record<string, string> = {
      'Very hot': 'Interested',
      'High': 'Interested',
      'Medium': 'Follow up needed',
      'Low': 'Follow up needed',
      'Not interested': 'Not a fit',
    };

    let inPersonStatus = 'Visited';
    if (spokeTo.toLowerCase().includes('owner')) inPersonStatus = 'Spoke with owner';
    else if (spokeTo.toLowerCase().includes('employee') || spokeTo.toLowerCase().includes('manager')) inPersonStatus = 'Spoke with employee';
    else if (!spokeTo && !visitOutcome) inPersonStatus = 'No one available';
    else if (visitOutcome.toLowerCase().includes('card')) inPersonStatus = 'Left card';
    else if (followUpDate) inPersonStatus = 'Follow up scheduled';

    if (leadId) {
      const newStatus = statusMap[interestLevel] || 'Follow up needed';
      await sql`
        UPDATE leads SET
          lead_status = ${newStatus},
          last_contacted_date = ${today},
          in_person_visit_status = ${inPersonStatus},
          last_visited_date = ${today},
          next_follow_up_date = ${followUpDate || ''},
          visit_notes = ${notes},
          updated_date = ${ts}
        WHERE id = ${leadId}
      `;

      const activityDesc = [
        'In-person visit completed.',
        spokeTo ? `Spoke with: ${spokeTo}.` : '',
        visitOutcome ? `Outcome: ${visitOutcome}.` : '',
        interestLevel ? `Interest level: ${interestLevel}.` : '',
        followUpDate ? `Follow-up: ${followUpDate}.` : '',
        notes ? `Notes: ${notes}` : '',
      ].filter(Boolean).join(' ');

      await sql`INSERT INTO activities (lead_id, type, description) VALUES (${leadId}, 'note', ${activityDesc})`;

      if (followUpDate && nextAction && nextAction !== 'No action') {
        const taskTypeMap: Record<string, string> = {
          'Call back': 'Call', 'Email': 'Email', 'Send demo': 'Send demo',
          'Build demo website': 'Build demo', 'Send proposal': 'Proposal',
          'Schedule meeting': 'Meeting',
        };
        const taskType = taskTypeMap[nextAction] || 'Follow up';
        const taskTitle = `${nextAction} - ${stop.businessName}`;
        await sql`
          INSERT INTO tasks (title, lead_id, due_date, task_type, priority, status, notes)
          VALUES (${taskTitle}, ${leadId}, ${followUpDate}, ${taskType}, 'High', 'pending', ${`After in-person visit. ${notes}`})
        `;
      }
    }

    return NextResponse.json({ success: true, inPersonStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to complete stop' }, { status: 500 });
  }
}