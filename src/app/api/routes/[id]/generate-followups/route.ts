import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// POST /api/routes/[id]/generate-followups
// Generates follow-up tasks for all completed stops that have a nextAction and followUpDate
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const routeId = Number(params.id);

    const stops = db.prepare(`
      SELECT * FROM route_stops
      WHERE routePlanId=? AND visitCompleted=1 AND followUpDate!='' AND nextAction!='' AND nextAction!='No action'
    `).all(routeId) as Record<string, unknown>[];

    const taskTypeMap: Record<string, string> = {
      'Call back': 'Call', 'Email': 'Email', 'Send demo': 'Send demo',
      'Build demo website': 'Build demo', 'Send proposal': 'Proposal',
      'Schedule meeting': 'Meeting',
    };

    let created = 0;
    const insertTask = db.prepare(`
      INSERT INTO tasks (title, leadId, dueDate, taskType, priority, status, notes)
      VALUES (?, ?, ?, ?, 'High', 'pending', ?)
    `);

    const createTasks = db.transaction(() => {
      for (const stop of stops) {
        if (!stop.leadId) continue;
        const taskType = taskTypeMap[stop.nextAction as string] || 'Follow up';
        insertTask.run(
          `${stop.nextAction} — ${stop.businessName}`,
          stop.leadId,
          stop.followUpDate,
          taskType,
          `Route follow-up. ${stop.notes || ''}`
        );
        created++;
      }
    });
    createTasks();

    return NextResponse.json({ created });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate follow-ups' }, { status: 500 });
  }
}
