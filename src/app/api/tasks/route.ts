import { NextRequest, NextResponse } from 'next/server';
import getDb, { isNoDbMode } from '@/lib/db';
import { getMockTasks } from '@/lib/mock-tasks';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const leadIdRaw = searchParams.get('leadId');
    const leadId = leadIdRaw ? Number(leadIdRaw) : null;

    if (leadIdRaw && (!Number.isFinite(leadId) || leadId! <= 0)) {
      return NextResponse.json({ error: 'Invalid leadId' }, { status: 400 });
    }

    if (isNoDbMode) {
      return NextResponse.json(getMockTasks(status || undefined, leadId));
    }

    const sql = getDb();

    const tasks = await sql`
      SELECT t.*, l.business_name as lead_name
      FROM tasks t
      LEFT JOIN leads l ON t.lead_id = l.id
      WHERE 1=1
      ${status ? sql`AND t.status = ${status}` : sql``}
      ${leadId ? sql`AND t.lead_id = ${leadId}` : sql``}
      ORDER BY t.due_date ASC, t.priority DESC
    `;

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (isNoDbMode) {
      const task = {
        id: Date.now(),
        title: body.title || 'New Task',
        leadId: body.leadId ?? null,
        dueDate: body.dueDate || new Date().toISOString().slice(0, 10),
        taskType: body.taskType || 'Follow up',
        priority: body.priority || 'Normal',
        status: body.status || 'pending',
        notes: body.notes || '',
        createdDate: ts,
        updatedDate: ts,
      };
      return NextResponse.json(task, { status: 201 });
    }

    const sql = getDb();
    const data = {
      title: body.title || '',
      leadId: body.leadId ?? null,
      dueDate: body.dueDate || '',
      taskType: body.taskType || 'Follow up',
      priority: body.priority || 'Normal',
      status: body.status || 'pending',
      notes: body.notes || '',
      createdDate: ts,
      updatedDate: ts,
    };
    const [{ id }] = await sql`INSERT INTO tasks ${sql(data)} RETURNING id`;
    const [task] = await sql`SELECT t.*, l.business_name as lead_name FROM tasks t LEFT JOIN leads l ON t.lead_id = l.id WHERE t.id = ${id}`;
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}