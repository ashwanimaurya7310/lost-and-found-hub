'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next';
import { z } from 'zod';
import { authStore, registeredStudentsStore, useItems, type SessionUser } from '@/lib/items-store';
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
  UserCheck,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  identifier: z
    .string()
    .min(2, 'Please enter your email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useItems();

  useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    const result = registeredStudentsStore.authenticate(data.identifier, data.password);

    if (!result.success || !result.student) {
      setError('password', {
        type: 'manual',
        message: result.error || 'Authentication failed. Please verify credentials.',
      });
      toast({
        title: 'Access Denied',
        description: result.error || 'Invalid Student ID/Gmail or password.',
        variant: 'destructive',
      });
      return;
    }

    const student = result.student;
    const userSession: SessionUser = {
      id: student.email,
      name: student.name,
      email: student.email,
      phone: student.phone,
      studentId: student.studentId,
      role: 'user',
    };

    // Save to auth store & cookies
    authStore.setUser(userSession);
    setCookie('user_session', JSON.stringify(userSession), {
      maxAge: 60 * 60 * 24 * 7,
    });

    toast({
      title: `Welcome back, ${student.name}!`,
      description: `Signed in successfully with Student ID: ${student.studentId}`,
    });

    // Redirect to home catalog
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 bg-gradient-to-b from-background via-muted/20 to-muted/40">
      <Card className="mx-auto max-w-md w-full shadow-2xl border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="mb-2 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border mx-auto">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Student & User Portal</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Student Sign In</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter your email address and password to access the Lost &amp; Found portal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Identifier (Email) */}
            <div className="grid gap-2">
              <Label htmlFor="identifier" className="font-semibold text-xs">
                Email Address
              </Label>
              <Input
                id="identifier"
                type="email"
                placeholder="student@ashoka.com"
                {...register('identifier')}
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs font-medium">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-xs">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && (
                <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit & Register Options Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Button
                type="submit"
                className="w-full font-semibold shadow-sm text-xs py-5 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
                disabled={isSubmitting}
              >
                <LogIn className="w-3.5 h-3.5" />
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              <Button
                type="button"
                asChild
                variant="outline"
                className="w-full font-semibold text-xs py-5 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <Link href="/signup">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Register ID
                </Link>
              </Button>
            </div>
          </form>

        </CardContent>

        <CardFooter className="bg-muted/40 border-t p-4 flex flex-col gap-2.5 text-center">
          <div className="w-full flex items-center justify-center text-xs">
            <span className="text-muted-foreground mr-1.5">Don&apos;t have an account?</span>
            <Link href="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
              Create Account here
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
