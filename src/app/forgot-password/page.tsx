'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { Mail, ArrowLeft, Copy, CheckCircle2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const forgotSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

type ForgotSchema = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotSchema) => {
    try {
      const res = await fetch('/api/students/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast({
          title: 'Something went wrong',
          description: json.error || 'Failed to process request.',
          variant: 'destructive',
        });
        return;
      }

      if (json.resetToken) {
        setResetToken(json.resetToken);
        setStudentName(json.studentName || '');
        toast({
          title: 'Reset link generated!',
          description: 'Use the token below to reset your password.',
        });
      } else {
        // Email not found — generic success message to avoid enumeration
        toast({
          title: 'Request received',
          description:
            'If an account with that email exists, a reset link would be sent.',
        });
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not connect to the server. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetLink = resetToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password?token=${resetToken}`
    : '';

  const handleCopy = async () => {
    if (!resetLink) return;
    await navigator.clipboard.writeText(resetLink);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Reset link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 bg-gradient-to-b from-background via-muted/20 to-muted/40">
      <Card className="mx-auto max-w-md w-full shadow-2xl border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="mb-2 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mx-auto">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password Recovery</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter your registered email address and we&apos;ll generate a
            password reset link for you.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!resetToken ? (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-semibold text-xs">
                  Registered Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@ashoka.com"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-semibold shadow-sm text-xs py-5 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5"
                disabled={isSubmitting}
              >
                <Mail className="w-3.5 h-3.5" />
                {isSubmitting ? 'Generating reset link...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            /* ── Success State ── */
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Reset link ready{studentName ? ` for ${studentName}` : ''}!
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    This link expires in <strong>15 minutes</strong>. Copy it
                    and open it in your browser to set a new password.
                  </p>
                </div>
              </div>

              {/* Reset link box */}
              <div className="grid gap-1.5">
                <Label className="font-semibold text-xs">Your Reset Link</Label>
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0 rounded-md border bg-muted/50 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground break-all leading-relaxed font-mono select-all">
                      {resetLink}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 flex items-center gap-1.5 text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Or click directly */}
              <Button
                type="button"
                asChild
                className="w-full font-semibold text-xs py-5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link href={`/reset-password?token=${resetToken}`}>
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                  Open Reset Page Now
                </Link>
              </Button>

              <p className="text-center text-[10px] text-muted-foreground">
                ⚠️ In a production environment, this link would be sent to your
                registered email address instead of being displayed here.
              </p>
            </div>
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
