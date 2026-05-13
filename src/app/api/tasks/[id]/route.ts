import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const task = db.prepare('SELECT t.*, l.businessName as leadName FROM tasks t LEFT JOIN leads l ON t.leadId = l.id WHERE t.id = ?').get(params.id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json(task);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const b = await req.json();
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(params.id) as Record<string, unknown> | undefined;
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    db.prepare(`
      UPDATE tasks SET title=?, leadId=?, dueDate=?, taskType=?, priority=?, status=?, notes=?,
      updatedDate=datetime('now','localtime') WHERE id=?
    `).run(
      b.title ?? existing.title, b.leadId !== undefined ? b.leadId : existing.leadId,
      b.dueDate ?? existing.dueDate, b.taskType ?? existing.taskType,
      b.priority ?? existing.priority, b.status ?? existing.status,
      b.notes ?? existing.notes, params.id
    );
    const updated = db.prepare('SELECT t.*, l.businessName as leadName FROM tasks t LEFT JOIN leads l ON t.leadId = l.id WHERE t.id = ?').get(params.id);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM tasks WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
