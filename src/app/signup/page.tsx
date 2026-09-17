'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { setCookie } from 'cookies-next';
import { authStore, registeredStudentsStore, type SessionUser } from '@/lib/items-store';
import type { StudentRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import {
  UserPlus,
  Sparkles,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldCheck,
  IdCard,
  Mail,
  Phone,
  Lock,
  User,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z
      .string()
      .email('Please enter a valid Gmail / Email address')
      .refine((val) => val.includes('@'), {
        message: 'Enter a valid email address with @',
      }),
    phone: z
      .string()
      .min(7, 'Please enter a valid contact phone number')
      .max(15, 'Phone number is too long'),
    studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z.string().min(4, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [registeredStudent, setRegisteredStudent] = useState<StudentRecord | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      studentId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleGenerateId = () => {
    const newId = registeredStudentsStore.generateStudentId();
    setValue('studentId', newId, { shouldValidate: true });
    toast({
      title: 'Student ID Generated',
      description: `Assigned ID: ${newId}`,
    });
  };

  const handleQuickFill = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setValue('name', 'Priya Patel');
    setValue('email', `priya.patel${randomNum}@gmail.com`);
    setValue('phone', '+91 98234 56789');
    setValue('studentId', `ASH-2024-${randomNum}`);
    setValue('password', 'Student@123');
    setValue('confirmPassword', 'Student@123');
  };

  const onSubmit = async (data: RegisterSchema) => {
    const result = registeredStudentsStore.register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      studentId: data.studentId,
      password: data.password,
    });

    if (!result.success || !result.student) {
      toast({
        title: 'Registration Failed',
        description: result.error || 'Could not complete registration.',
        variant: 'destructive',
      });
      return;
    }

    setRegisteredStudent(result.student);
    toast({
      title: '🎉 Registration Successful!',
      description: `Welcome ${result.student.name}! Your Student ID is ${result.student.studentId}`,
    });
  };

  const handleAutoLogin = () => {
    if (!registeredStudent) return;

    const userSession: SessionUser = {
      id: registeredStudent.email,
      name: registeredStudent.name,
      email: registeredStudent.email,
      phone: registeredStudent.phone,
      studentId: registeredStudent.studentId,
      role: 'user',
    };

    authStore.setUser(userSession);
    setCookie('user_session', JSON.stringify(userSession), {
      maxAge: 60 * 60 * 24 * 7,
    });

    toast({
      title: `Welcome, ${registeredStudent.name}!`,
      description: 'You are now signed in to the Lost & Found Hub.',
    });

    router.replace('/');
  };

  const handleCopyId = () => {
    if (!registeredStudent) return;
    navigator.clipboard.writeText(registeredStudent.studentId);
    setCopiedId(true);
    toast({
      title: 'Copied to Clipboard',
      description: `Student ID: ${registeredStudent.studentId}`,
    });
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    /* ── Outer page: royal-blue creative background ── */
    <div
      className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #1e40af 100%)" }}
    >
      {/* ── Decorative background elements ── */}
      {/* Corner circles */}
      <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full opacity-25 pointer-events-none" style={{ background: "#60a5fa" }} />
      <div className="absolute top-[-60px] right-[-60px] w-60 h-60 rounded-full opacity-20 pointer-events-none" style={{ background: "#93c5fd" }} />
      <div className="absolute bottom-[-100px] left-[-100px] w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: "#60a5fa" }} />
      <div className="absolute bottom-[15%] right-[5%] w-24 h-24 rounded-full opacity-15 pointer-events-none" style={{ background: "#bfdbfe" }} />

      {/* Watermark letters */}
      <div className="absolute bottom-0 left-0 text-[220px] font-black leading-none select-none pointer-events-none opacity-10" style={{ color: "#93c5fd" }}>R</div>
      <div className="absolute top-0 right-[12%] text-[150px] font-black leading-none select-none pointer-events-none opacity-10" style={{ color: "#93c5fd" }}>✓</div>

      {/* ── Main two-column card ── */}
      <div
        className="relative z-10 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        style={{ background: "linear-gradient(135deg, #0c2568 0%, #0a1e5c 50%, #0d2a80 100%)", minHeight: "600px" }}
      >
        {/* ── Left panel: Lost & Found illustration ── */}
        <div className="hidden lg:flex w-80 xl:w-96 flex-col items-center justify-center relative overflow-hidden select-none shrink-0">
          {/* Full-panel illustration – Next.js Image handles basePath automatically */}
          <Image
            src="/lost-found-illustration.jpg"
            alt="Lost and Found illustration"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,30,92,0.45) 0%, rgba(10,30,92,0.2) 100%)" }} />

          {/* Hero badge overlay — centred on image */}
          <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
            <div
              className="px-5 py-4 rounded-2xl shadow-2xl text-center"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mb-1">Lost &amp; Found Hub</p>
              <p className="text-white text-2xl font-extrabold leading-tight">Registration</p>
              <p className="text-emerald-300 text-sm font-bold mt-1">✓ Verified Portal</p>
            </div>

            <p className="text-white/70 text-xs max-w-[200px] leading-relaxed drop-shadow">
              Register once to report or claim lost items across campus.
            </p>
          </div>
        </div>

        {/* ── Right panel: frosted-glass form ── */}
        <div className="flex-1 flex items-start justify-center p-6 lg:p-10 overflow-y-auto">
          <div className="w-full max-w-md">
            {!registeredStudent ? (
              /* ── Registration Form ── */
              <div
                className="rounded-2xl p-7 shadow-2xl border border-white/20"
                style={{ background: "rgba(255,255,255,0.11)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
              >
                {/* Form header */}
                <div className="mb-6">
                  <p className="text-blue-200/80 text-[11px] font-semibold tracking-widest uppercase mb-1">Ashoka Institute</p>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">Create Student Account</h1>
                  <p className="text-white/50 text-xs mt-1">Register to access the Lost &amp; Found portal.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
                  {/* Full Name */}
                  <div className="grid gap-1.5">
                    <label htmlFor="reg-name" className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />Full Name
                    </label>
                    <input
                      id="reg-name"
                      placeholder="e.g. Full Name"
                      className="w-full h-10 px-3 rounded-lg bg-white text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                      {...register('name')}
                    />
                    {errors.name && <p className="text-red-300 text-xs">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="grid gap-1.5">
                    <label htmlFor="reg-email" className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />Email
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="student email"
                      className="w-full h-10 px-3 rounded-lg bg-white text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                      {...register('email')}
                    />
                    {errors.email && <p className="text-red-300 text-xs">{errors.email.message}</p>}
                  </div>

                  {/* Phone */}
                  <div className="grid gap-1.5">
                    <label htmlFor="reg-phone" className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />Phone Number (for claim contact)
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="+91 ----------"
                      className="w-full h-10 px-3 rounded-lg bg-white text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                      {...register('phone')}
                    />
                    {errors.phone && <p className="text-red-300 text-xs">{errors.phone.message}</p>}
                  </div>

                  {/* Student ID */}
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="reg-studentId" className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                        <IdCard className="w-3.5 h-3.5" />Student ID
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateId}
                        className="text-[11px] text-blue-200 hover:text-white font-medium inline-flex items-center gap-1 transition"
                      >
                        <RefreshCw className="w-3 h-3" />Auto-Generate ID
                      </button>
                    </div>
                    <input
                      id="reg-studentId"
                      placeholder="Student ID number"
                      className="w-full h-10 px-3 rounded-lg bg-white text-gray-800 text-sm font-mono tracking-wider font-semibold uppercase placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                      {...register('studentId')}
                    />
                    {errors.studentId && <p className="text-red-300 text-xs">{errors.studentId.message}</p>}
                    <p className="text-[11px] text-white/40">This unique Student ID can be used with your password to sign in.</p>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <label htmlFor="reg-password" className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />Set Password
                      </label>
                      <input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-lg bg-white text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                        {...register('password')}
                      />
                      {errors.password && <p className="text-red-300 text-xs">{errors.password.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <label htmlFor="reg-confirm" className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />Confirm Password
                      </label>
                      <input
                        id="reg-confirm"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-lg bg-white text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                        {...register('confirmPassword')}
                      />
                      {errors.confirmPassword && <p className="text-red-300 text-xs">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
                    >
                      <UserPlus className="w-4 h-4" />
                      {isSubmitting ? 'Registering...' : 'Register & Obtain Student ID'}
                    </button>
                  </div>
                </form>

                {/* Divider + quick fill */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-px bg-white/15" />
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[10px] text-white/50 hover:text-white/80 transition inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />Fill Sample Details
                  </button>
                  <div className="flex-1 h-px bg-white/15" />
                </div>

                {/* Already registered */}
                <p className="text-center text-[12px] text-white/50 mt-4">
                  Already registered?{" "}
                  <Link href="/" className="text-white font-bold hover:underline">
                    Sign In to your account
                  </Link>
                </p>
              </div>
            ) : (
              /* ── Registration Success Card ── */
              <div
                className="rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                style={{ background: "rgba(255,255,255,0.11)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-1">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Registration Complete!</h2>
                  <p className="text-xs text-emerald-100 max-w-sm mx-auto">
                    Your student profile has been created and verified. Keep your Student ID safe for future logins.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Virtual Student Card */}
                  <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Logo size="sm" />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-primary">Ashoka Institute</div>
                          <div className="text-[10px] text-slate-400">Student Identity Card</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">Active</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider">Student Name</span>
                        <p className="text-base font-bold text-white">{registeredStudent.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider">Assigned Student ID</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-sm font-bold text-amber-300">{registeredStudent.studentId}</span>
                            <button onClick={handleCopyId} title="Copy Student ID" className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {copiedId && <span className="text-[10px] text-emerald-400">Copied!</span>}
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider">Phone</span>
                          <p className="font-medium text-slate-200 mt-0.5">{registeredStudent.phone}</p>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider">Registered Gmail</span>
                        <p className="font-medium text-slate-200 truncate">{registeredStudent.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5">
                    <button
                      onClick={handleAutoLogin}
                      className="w-full h-11 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                    >
                      <LogIn className="w-4 h-4" />Sign In Now &amp; Enter Portal
                    </button>
                    <Link
                      href="/"
                      className="w-full h-10 rounded-lg border border-white/25 text-white/80 hover:text-white hover:border-white/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      Go to Login Page
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick-fill dev helper */}
      <div className="absolute bottom-4 right-4 z-20 opacity-50 hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleQuickFill}
          className="text-[10px] text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-2.5 py-1 font-medium backdrop-blur transition inline-flex items-center gap-1"
        >
          <Sparkles className="w-2.5 h-2.5" />Demo Fill
        </button>
      </div>
    </div>
  );
}
