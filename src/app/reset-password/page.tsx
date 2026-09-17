'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetSchema = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenError(
        'No reset token found. Please request a new password reset link.'
      );
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetSchema) => {
    try {
      const res = await fetch('/api/students/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast({
          title: 'Reset failed',
          description:
            json.error ||
            'Failed to reset password. The link may have expired.',
          variant: 'destructive',
        });
        return;
      }

      setSuccess(true);
      toast({
        title: 'Password updated!',
        description: 'Your password has been reset successfully.',
      });

      setTimeout(() => router.push('/login'), 3000);
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not connect to the server. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 bg-gradient-to-b from-background via-muted/20 to-muted/40">
      <Card className="mx-auto max-w-md w-full shadow-2xl border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="mb-2 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border mx-auto">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Reset Password</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Set New Password
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Choose a new password for your student account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Token error */}
          {tokenError && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3.5">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Invalid reset link
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                  {tokenError}
                </p>
              </div>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Password reset successful!
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    You will be redirected to the sign-in page in a moment…
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="w-full font-semibold text-xs py-5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link href="/login">Go to Sign In</Link>
              </Button>
            </div>
          )}

          {/* Reset form */}
          {!success && !tokenError && (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {/* New Password */}
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="font-semibold text-xs">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="font-semibold text-xs"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-semibold shadow-sm text-xs py-5 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
                disabled={isSubmitting || !token}
              >
                <KeyRound className="w-3.5 h-3.5" />
                {isSubmitting ? 'Resetting password…' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="bg-muted/40 border-t p-4 flex justify-center">
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
