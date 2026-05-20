import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const routeId = Number(params.id);

    const stops = await sql`
      SELECT * FROM route_stops
      WHERE route_plan_id = ${routeId}
        AND visit_completed = 1
        AND follow_up_date != ''
        AND next_action != ''
        AND next_action != 'No action'
    ` as Record<string, unknown>[];

    const taskTypeMap: Record<string, string> = {
      'Call back': 'Call', 'Email': 'Email', 'Send demo': 'Send demo',
      'Build demo website': 'Build demo', 'Send proposal': 'Proposal',
      'Schedule meeting': 'Meeting',
    };

    let created = 0;
    for (const stop of stops) {
      if (!stop.leadId) continue;
      const taskType = taskTypeMap[stop.nextAction as string] || 'Follow up';
      await sql`
        INSERT INTO tasks (title, lead_id, due_date, task_type, priority, status, notes)
        VALUES (
          ${`${stop.nextAction} - ${stop.businessName}`},
          ${stop.leadId as number},
          ${stop.followUpDate as string},
          ${taskType},
          'High',
          'pending',
          ${`Route follow-up. ${stop.notes || ''}`}
        )
      `;
      created++;
    }

    return NextResponse.json({ created });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate follow-ups' }, { status: 500 });
  }
}