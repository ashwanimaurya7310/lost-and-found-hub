import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const students = serverDb.getStudents();
    const student = students.find((s) => s.resetPasswordToken === token);

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    if (
      !student.resetPasswordExpiry ||
      new Date(student.resetPasswordExpiry) < new Date()
    ) {
      return NextResponse.json(
        { success: false, error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update password and clear reset token
    serverDb.updateStudent(student.email, {
      password: newPassword,
      resetPasswordToken: undefined,
      resetPasswordExpiry: undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error in POST /api/students/reset-password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
