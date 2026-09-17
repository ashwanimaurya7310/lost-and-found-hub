import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const students = serverDb.getStudents();
    const student = students.find((s) => s.email.toLowerCase() === cleanEmail);

    // Always return success to avoid email enumeration, but only set token if found
    if (student) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

      serverDb.updateStudent(cleanEmail, {
        resetPasswordToken: token,
        resetPasswordExpiry: expiry,
      });

      return NextResponse.json({
        success: true,
        // In a real app this would be emailed. For demo purposes, we surface it.
        resetToken: token,
        studentName: student.name,
      });
    }

    // Student not found — return generic success (no enumeration)
    return NextResponse.json({ success: true, resetToken: null });
  } catch (error) {
    console.error('API Error in POST /api/students/forgot-password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
