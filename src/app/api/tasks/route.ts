import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const leadId = searchParams.get('leadId') || '';

    let query = `
      SELECT t.*, l.businessName as leadName FROM tasks t
      LEFT JOIN leads l ON t.leadId = l.id WHERE 1=1
    `;
    const params: unknown[] = [];
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (leadId) { query += ' AND t.leadId = ?'; params.push(leadId); }
    query += ' ORDER BY t.dueDate ASC, t.priority DESC';

    return NextResponse.json(db.prepare(query).all(...params));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const b = await req.json();
    const result = db.prepare(`
      INSERT INTO tasks (title, leadId, dueDate, taskType, priority, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(b.title || '', b.leadId ?? null, b.dueDate || '', b.taskType || 'Follow up',
           b.priority || 'Normal', b.status || 'pending', b.notes || '');
    const task = db.prepare('SELECT t.*, l.businessName as leadName FROM tasks t LEFT JOIN leads l ON t.leadId = l.id WHERE t.id = ?').get(result.lastInsertRowid);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
