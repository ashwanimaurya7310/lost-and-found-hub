import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import type { StudentRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const students = serverDb.getStudents();
    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('API Error in GET /api/students:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const students = serverDb.getStudents();

    const emailClean = (data.email || '').trim().toLowerCase();
    const studentIdClean = (data.studentId && data.studentId.trim().toUpperCase()) || `ASH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (students.some((s) => s.email.toLowerCase() === emailClean)) {
      return NextResponse.json(
        { success: false, error: 'A student with this Gmail address is already registered.' },
        { status: 400 }
      );
    }

    if (students.some((s) => s.studentId.toUpperCase() === studentIdClean)) {
      return NextResponse.json(
        { success: false, error: 'This Student ID is already registered. Please use another ID.' },
        { status: 400 }
      );
    }

    const newStudent: StudentRecord = {
      id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: (data.name || '').trim(),
      email: emailClean,
      phone: (data.phone || '').trim(),
      studentId: studentIdClean,
      password: data.password || '',
      registeredAt: new Date().toISOString(),
    };

    const saved = serverDb.addStudent(newStudent);
    return NextResponse.json({ success: true, student: saved });
  } catch (error) {
    console.error('API Error in POST /api/students:', error);
    return NextResponse.json({ success: false, error: 'Failed to register student' }, { status: 500 });
  }
}
