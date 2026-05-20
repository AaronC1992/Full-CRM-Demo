import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const templates = await sql`SELECT * FROM templates ORDER BY name ASC`;
    return NextResponse.json(templates);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const data = {
      name: body.name || '',
      type: body.type || 'cold_call',
      content: body.content || '',
      createdDate: ts,
      updatedDate: ts,
    };
    const [template] = await sql`INSERT INTO templates ${sql(data)} RETURNING *`;
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}