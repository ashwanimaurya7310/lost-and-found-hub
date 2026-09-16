'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { setCookie } from 'cookies-next';
import { authStore, useItems } from '@/lib/items-store';
import { Logo } from '@/components/logo';
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
import { ShieldCheck, Lock, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const adminLoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid administrator email address.')
    .min(1, 'Admin Email is required'),
  password: z.string().min(4, 'Password must be at least 4 characters.'),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { adminUser, isLoaded } = useItems();

  useEffect(() => {
    if (isLoaded && adminUser) {
      router.replace('/admin');
    }
  }, [adminUser, isLoaded, router]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AdminLoginValues) => {
    setAuthError(null);

    // Validate admin credentials
    const validEmails = ['admin@ashoka.com', 'admin@example.com', 'moderator@ashoka.com'];
    const isEmailValid =
      data.email.toLowerCase().includes('admin') ||
      validEmails.includes(data.email.toLowerCase()) ||
      data.email.endsWith('@ashoka.com');

    if (!isEmailValid) {
      setAuthError('Unauthorized: Only official Administrator accounts can access the Admin Portal.');
      return;
    }

    if (data.password.trim().toLowerCase() !== 'ashoka') {
      setAuthError('Unauthorized: Incorrect password. Enter the administrator password ("Ashoka").');
      setError('password', {
        type: 'manual',
        message: 'Incorrect password. Please enter "Ashoka".',
      });
      return;
    }

    try {
      const adminSession = {
        id: 'admin_master_1',
        name: data.email.split('@')[0].toUpperCase() + ' (Admin)',
        email: data.email,
        role: 'admin' as const,
      };

      // Save admin session to store & cookies
      authStore.setAdmin(adminSession);
      setCookie('admin_session', JSON.stringify(adminSession), {
        maxAge: 60 * 60 * 24 * 7,
      });

      toast({
        title: 'Admin Authentication Verified',
        description: `Welcome to the Admin Moderation Dashboard, ${adminSession.name}.`,
      });

      router.replace('/admin');
    } catch (err) {
      console.error(err);
      setAuthError('Failed to sign in to Admin Portal. Please check credentials.');
    }
  };

  const handleQuickDemoFill = () => {
    setValue('email', 'admin@ashoka.com');
    setValue('password', 'Ashoka');
    setAuthError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-background">
      <div className="w-full max-w-md space-y-4">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Link href="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Student Portal
            </Link>
          </Button>

          <Button
            asChild
            variant="link"
            size="sm"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            <Link href="/login">User / Student Login →</Link>
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 text-white shadow-2xl backdrop-blur">
          <CardHeader className="space-y-3 text-center pb-6 border-b border-slate-800">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                Administrator Portal
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Restricted access for staff & faculty moderators to review reports, approve public listings, and verify claims.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {authError && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Admin Email */}
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-xs font-semibold text-slate-200">
                  Administrator Email
                </Label>
                <div className="relative">
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@ashoka.com"
                    className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Admin Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-pass" className="text-xs font-semibold text-slate-200">
                    Master Password
                  </Label>
                </div>
                <Input
                  id="admin-pass"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-5 shadow-md shadow-amber-500/20"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Authenticating Admin...' : 'Sign In to Admin Dashboard'}
              </Button>
            </form>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Demo Quick Access:</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleQuickDemoFill}
                className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1" />
                Fill Admin Credentials
              </Button>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-950/40 border-t border-slate-800/80 p-4 text-center justify-center">
            <p className="text-xs text-slate-400">
              Looking for student login?{' '}
              <Link href="/login" className="text-amber-400 hover:underline font-medium">
                Go to Student Portal
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
