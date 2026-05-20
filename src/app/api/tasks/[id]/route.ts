import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const [task] = await sql`SELECT t.*, l.business_name as lead_name FROM tasks t LEFT JOIN leads l ON t.lead_id = l.id WHERE t.id = ${params.id}`;
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
      updatedDate: ts,
    };
    const [task] = await sql`UPDATE tasks SET ${sql(data)} WHERE id = ${params.id} RETURNING *`;
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await sql`DELETE FROM tasks WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}