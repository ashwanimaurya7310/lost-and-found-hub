'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 bg-gradient-to-b from-background via-muted/20 to-muted/40">
      <div className="w-full max-w-lg">
        {!registeredStudent ? (
          <Card className="shadow-2xl border-primary/20 bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="mb-2 flex justify-center">
                <Logo size="lg" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mx-auto">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Student Registration Portal</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create Student Account</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Register with your details to obtain your verified Student ID and access the Lost & Found portal.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
                {/* Full Name */}
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Full Name"
                    className="h-9 text-sm"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                {/* Gmail / Email Address */}
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student email"
                    className="h-9 text-sm"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="grid gap-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    Phone Number (for claim contact)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 ----------"
                    className="h-9 text-sm"
                    {...register('phone')}
                  />
                  {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                </div>

                {/* Student ID (Custom or Auto-Generated) */}
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="studentId" className="text-xs font-semibold flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-primary" />
                      Student ID
                    </Label>
                    <button
                      type="button"
                      onClick={handleGenerateId}
                      className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Auto-Generate ID
                    </button>
                  </div>
                  <Input
                    id="studentId"
                    placeholder="Student ID number"
                    className="h-9 text-sm font-mono tracking-wider font-semibold uppercase"
                    {...register('studentId')}
                  />
                  {errors.studentId && (
                    <p className="text-destructive text-xs">{errors.studentId.message}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    This unique Student ID can be used along with your password to sign in.
                  </p>
                </div>

                {/* Passwords grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                      Set Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-9 text-sm"
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="text-destructive text-xs">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-primary" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-9 text-sm"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full font-semibold py-5 shadow-sm text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isSubmitting}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Registering...' : 'Register & Obtain Student ID'}
                  </Button>
                </div>
              </form>

              {/* Quick Fill Button */}
              <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>Quick Registration:</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleQuickFill}
                  className="h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Fill Sample Details
                </Button>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/40 border-t p-4 flex flex-col gap-2 text-center text-xs">
              <div className="flex items-center justify-center gap-1">
                <span className="text-muted-foreground">Already registered?</span>
                <Link href="/login" className="text-primary font-semibold hover:underline inline-flex items-center">
                  Sign In to your account
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </CardFooter>
          </Card>
        ) : (
          /* Registration Success & Student ID Card Display */
          <Card className="shadow-2xl border-emerald-500/30 bg-card/95 backdrop-blur overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Registration Complete!</h2>
              <p className="text-xs text-emerald-100 max-w-sm mx-auto">
                Your student profile has been created and verified. Keep your Student ID safe for future logins.
              </p>
            </div>

            <CardContent className="p-6 space-y-5">
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
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                    Active
                  </span>
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
                        <span className="font-mono text-sm font-bold text-amber-300">
                          {registeredStudent.studentId}
                        </span>
                        <button
                          onClick={handleCopyId}
                          title="Copy Student ID"
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
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
                <Button
                  onClick={handleAutoLogin}
                  className="w-full font-bold py-5 shadow-sm text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In Now & Enter Portal
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full text-xs font-semibold"
                >
                  <Link href="/login">
                    Go to Login Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
