import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const leadIdRaw = searchParams.get('leadId');
    const leadId = leadIdRaw ? Number(leadIdRaw) : null;

    if (leadIdRaw && (!Number.isFinite(leadId) || leadId! <= 0)) {
      return NextResponse.json({ error: 'Invalid leadId' }, { status: 400 });
    }

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
    const sql = getDb();
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
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