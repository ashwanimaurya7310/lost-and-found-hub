"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from "cookies-next";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/item-card";
import { Logo } from "@/components/logo";
import { categories } from "@/lib/data";
import { useItems, authStore } from "@/lib/items-store";
import type { Item, Category } from "@/lib/types";
import {
  Search,
  PlusCircle,
  Sparkles,
  Package,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  LayoutDashboard,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { registeredStudentsStore, type SessionUser } from "@/lib/items-store";
import { UserPlus, LogIn, IdCard } from "lucide-react";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(2, "Please enter your Gmail address or Student ID"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function HomeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { publicItems, isLoaded, currentUser, adminUser } = useItems();

  const queryTab = searchParams.get("tab") || "all";
  const queryParam = searchParams.get("query") || "";
  const initialCategory = searchParams.get("category") || "all";

  // Local state for search & dropdowns in authenticated view
  const [activeTab, setActiveTab] = useState<string>(queryTab);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    if (queryTab === "lost" || queryTab === "found" || queryTab === "all") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  // If Admin is logged in, redirect directly to Admin Dashboard so login page never reappears on back navigation
  useEffect(() => {
    if (isLoaded && adminUser && !currentUser) {
      router.replace("/admin");
    }
  }, [isLoaded, adminUser, currentUser, router]);

  // Login form handler
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: LoginSchema) => {
    const result = registeredStudentsStore.authenticate(data.identifier, data.password);

    if (!result.success || !result.student) {
      setError("password", {
        type: "manual",
        message: result.error || "Authentication failed. Please verify credentials.",
      });
      toast({
        title: "Access Denied",
        description: result.error || "Invalid Student ID/Gmail or password.",
        variant: "destructive",
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
      role: "user",
    };

    authStore.setUser(userSession);
    setCookie("user_session", JSON.stringify(userSession), {
      maxAge: 60 * 60 * 24 * 7,
    });

    toast({
      title: `Welcome, ${student.name}!`,
      description: `Signed in successfully with Student ID: ${student.studentId}`,
    });

    router.replace("/");
  };

  const handleQuickFill = () => {
    setValue("identifier", "student@ashoka.com");
    setValue("password", "Admin");
  };

  const handleQuickFillId = () => {
    setValue("identifier", "ASHOKA-2024-001");
    setValue("password", "Admin");
  };

  // Lost & Found counts
  const lostItemsCount = useMemo(
    () => publicItems.filter((i) => i.status === "lost").length,
    [publicItems]
  );
  const foundItemsCount = useMemo(
    () => publicItems.filter((i) => i.status === "found").length,
    [publicItems]
  );

  // Filtering logic on public items
  const filteredItems = useMemo(() => {
    return publicItems.filter((item) => {
      const matchesQuery =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        category === "all" ||
        item.category?.id === category ||
        item.category?.name?.toLowerCase() === category.toLowerCase();

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "lost" && item.status === "lost") ||
        (activeTab === "found" && item.status === "found");

      return matchesQuery && matchesCategory && matchesTab;
    });
  }, [publicItems, searchTerm, category, activeTab]);

  // Loading state while client session is being loaded
  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-sm">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading Lost & Found Hub...</span>
        </div>
      </div>
    );
  }

  // If NOT logged in (and not admin): Show creative blue login page
  if (!currentUser && !adminUser) {
    const handleGoogleClick = () => {
      setValue("identifier", "");
      toast({
        title: "Google Sign-in",
        description: "Enter your Gmail address above and your password to sign in.",
      });
      setTimeout(() => document.getElementById("login-identifier")?.focus(), 100);
    };

    return (
      <div
        className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center overflow-hidden px-4 py-8"
        style={{ background: "linear-gradient(135deg, #5bbdf5 0%, #4aaee8 40%, #6ecbff 100%)" }}
      >
        {/* ── Background decorative circles ── */}
        <div className="absolute top-[-110px] right-[-110px] w-80 h-80 rounded-full opacity-40 pointer-events-none" style={{ background: "#7fd4ff" }} />
        <div className="absolute top-[-55px] right-[-55px] w-52 h-52 rounded-full opacity-25 pointer-events-none" style={{ background: "#9de3ff" }} />
        <div className="absolute bottom-[-90px] left-[-90px] w-64 h-64 rounded-full opacity-30 pointer-events-none" style={{ background: "#7fd4ff" }} />
        <div className="absolute top-[35%] left-[4%] w-20 h-20 rounded-full opacity-20 pointer-events-none" style={{ background: "#b8e8ff" }} />
        {/* Big watermark letter */}
        <div className="absolute bottom-0 left-[-10px] text-[240px] font-black leading-none select-none pointer-events-none opacity-20" style={{ color: "#3a9dd4" }}>
          L
        </div>
        <div className="absolute bottom-0 right-[8%] text-[160px] font-black leading-none select-none pointer-events-none opacity-10" style={{ color: "#3a9dd4" }}>
          &
        </div>

        {/* ── Main dark navy card ── */}
        <div
          className="relative z-10 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          style={{ background: "linear-gradient(135deg, #0c2568 0%, #0a1e5c 50%, #0d2a80 100%)", minHeight: "520px" }}
        >
          {/* ── Left: decorative 3-D ribbon shapes ── */}
          <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden select-none" style={{ minHeight: "520px" }}>
            {/* Dark blob circles */}
            <div className="absolute bottom-[-30px] left-[-50px] w-52 h-52 rounded-full opacity-20" style={{ background: "#1a4fd6" }} />
            <div className="absolute top-8 right-4 w-36 h-36 rounded-full opacity-10" style={{ background: "#1a4fd6" }} />

            {/* SVG ribbons */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 520" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="r1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <linearGradient id="r2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bfdbfe" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="r3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="r4" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
                </filter>
              </defs>
              {/* Large S-curve — left centre */}
              <path d="M 70 60 C 200 60 220 160 110 220 C 0 280 30 380 180 400"
                stroke="url(#r1)" strokeWidth="32" strokeLinecap="round" fill="none" filter="url(#shadow)" opacity="0.9" />
              {/* Small C-curve below */}
              <path d="M 30 340 C 80 290 130 380 60 420"
                stroke="url(#r2)" strokeWidth="22" strokeLinecap="round" fill="none" filter="url(#shadow)" opacity="0.75" />
              {/* Top-right corner ribbon */}
              <path d="M 280 0 C 230 60 260 130 200 170 C 150 200 170 260 120 280"
                stroke="url(#r4)" strokeWidth="26" strokeLinecap="round" fill="none" filter="url(#shadow)" opacity="0.55" />
              {/* Bottom wavy squiggle */}
              <path d="M 20 460 C 80 420 120 490 170 455 C 210 425 240 480 280 460"
                stroke="url(#r3)" strokeWidth="20" strokeLinecap="round" fill="none" filter="url(#shadow)" opacity="0.6" />
              {/* Small top-left blob squiggle */}
              <path d="M 20 80 C 55 40 85 110 50 140"
                stroke="url(#r2)" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.65" />
              {/* Right-centre mini ribbon */}
              <path d="M 240 260 C 270 230 290 290 260 310"
                stroke="url(#r3)" strokeWidth="15" strokeLinecap="round" fill="none" opacity="0.5" />
            </svg>
          </div>

          {/* ── Right: glassmorphism sign-in form ── */}
          <div className="flex-1 flex items-center justify-center p-6 md:p-10">
            <div
              className="w-full max-w-sm rounded-2xl p-8 shadow-2xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
            >
              {/* Header */}
              <div className="mb-6">
                <p className="text-blue-200/80 text-[11px] font-semibold tracking-widest uppercase mb-1">Lost &amp; Found Hub</p>
                <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Sign in</h1>
              </div>

              <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                {/* Email / Student ID */}
                <div className="space-y-1.5">
                  <label htmlFor="login-identifier" className="text-sm font-semibold text-white/90">Email</label>
                  <input
                    id="login-identifier"
                    placeholder="username@gmail.com or Student ID"
                    autoComplete="username"
                    className="w-full h-10 px-3 rounded-lg bg-white text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                    {...register("identifier")}
                  />
                  {errors.identifier && (
                    <p className="text-red-300 text-xs font-medium">{errors.identifier.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="text-sm font-semibold text-white/90">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full h-10 px-3 rounded-lg bg-white/90 text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-red-300 text-xs font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="text-left">
                  <Link href="/forgot-password" className="text-xs text-blue-200/80 hover:text-white transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                {/* Sign In button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-lg font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
                  style={{ background: "linear-gradient(135deg, #0a1f5c 0%, #0d2a80 100%)" }}
                >
                  <LogIn className="w-4 h-4" />
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>
              </form>

              {/* Social divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-[11px] text-white/50 font-medium whitespace-nowrap">or continue with</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Social buttons */}
              <div className="flex gap-3">
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  title="Sign in with Google"
                  className="flex-1 h-10 rounded-lg bg-white hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  title="Sign in with GitHub"
                  onClick={() => toast({ title: "GitHub Login", description: "Coming soon! Use email/password for now." })}
                  className="flex-1 h-10 rounded-lg bg-white hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#24292e">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  title="Sign in with Facebook"
                  onClick={() => toast({ title: "Facebook Login", description: "Coming soon! Use email/password for now." })}
                  className="flex-1 h-10 rounded-lg bg-white hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>

              {/* Register link */}
              <p className="text-center text-[12px] text-white/50 mt-5">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-white font-bold hover:underline">
                  Register for free
                </Link>
              </p>

              {/* Admin link */}
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <Link
                  href="/admin/login"
                  className="text-[11px] text-amber-300/70 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Administrator / Faculty Login →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick-login dev helpers (small, bottom-right) */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[10px] text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-2.5 py-1 font-medium backdrop-blur transition"
          >
            <Sparkles className="w-2.5 h-2.5 inline mr-1" />Demo Gmail
          </button>
          <button
            type="button"
            onClick={handleQuickFillId}
            className="text-[10px] text-amber-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-2.5 py-1 font-medium backdrop-blur transition"
          >
            <IdCard className="w-2.5 h-2.5 inline mr-1" />Demo ID
          </button>
        </div>
      </div>
    );
  }

  // If Admin is logged in (without student session)
  if (adminUser && !currentUser) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center space-y-6">
        <div className="p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Portal Active</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            You are logged in as Administrator ({adminUser.email}). You can manage moderation, view claims, and approve listings.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              <Link href="/admin">Go to Admin Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-700 text-white hover:bg-slate-800"
              onClick={() => {
                authStore.logoutAdmin();
                window.location.reload();
              }}
            >
              Sign Out Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Student View: Options to View Lost or Found Items
  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl space-y-8">
      {/* Top Banner / Welcome */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Lost & Found Hub</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Welcome back, {currentUser?.name || "Student"}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Select an option below to search lost items or view recovered found items.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button asChild size="default" className="shadow-sm">
              <Link href="/report">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Report Lost / Found Item
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Options: Lost Items vs Found Items Selection Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Option 1: View Lost Items */}
        <div
          onClick={() => setActiveTab("lost")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 flex flex-col justify-between ${
            activeTab === "lost"
              ? "border-rose-500 bg-rose-500/5 shadow-md ring-2 ring-rose-500/20"
              : "border-border bg-card hover:border-rose-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                <Search className="w-3 h-3" />
                <span>Lost Items Section</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                View Lost Items
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Browse items that students have reported lost on campus. Check if you've seen any of these items.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
              <Search className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold">
            <span className="text-rose-600">
              {lostItemsCount} {lostItemsCount === 1 ? "Item" : "Items"} Reported Lost
            </span>
            <Button
              size="sm"
              variant={activeTab === "lost" ? "default" : "outline"}
              className={`h-8 text-xs ${activeTab === "lost" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
            >
              {activeTab === "lost" ? "Currently Viewing" : "View Lost Items →"}
            </Button>
          </div>
        </div>

        {/* Option 2: View Found Items */}
        <div
          onClick={() => setActiveTab("found")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 flex flex-col justify-between ${
            activeTab === "found"
              ? "border-emerald-500 bg-emerald-500/5 shadow-md ring-2 ring-emerald-500/20"
              : "border-border bg-card hover:border-emerald-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Package className="w-3 h-3" />
                <span>Found Items Section</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                View Found Items
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Browse recovered items awaiting claim. If one belongs to you, submit a claim proof.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-600">
              {foundItemsCount} {foundItemsCount === 1 ? "Item" : "Items"} Recovered & Ready
            </span>
            <Button
              size="sm"
              variant={activeTab === "found" ? "default" : "outline"}
              className={`h-8 text-xs ${activeTab === "found" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
            >
              {activeTab === "found" ? "Currently Viewing" : "View Found Items →"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 md:p-6 bg-card rounded-xl shadow-sm border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Section Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 w-full md:w-[380px] h-10">
              <TabsTrigger value="all" className="text-xs">
                All Items ({publicItems.length})
              </TabsTrigger>
              <TabsTrigger value="lost" className="text-xs font-semibold text-rose-600">
                🔍 Lost ({lostItemsCount})
              </TabsTrigger>
              <TabsTrigger value="found" className="text-xs font-semibold text-emerald-600">
                📦 Found ({foundItemsCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quick Clear */}
          {(searchTerm || category !== "all" || activeTab !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground self-start md:self-center"
              onClick={() => {
                setSearchTerm("");
                setCategory("all");
                setActiveTab("all");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-12 items-center pt-2">
          {/* Search Input */}
          <div className="relative md:col-span-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder={`Search ${activeTab === "lost" ? "lost items" : activeTab === "found" ? "found items" : "items"} by name, location, or description...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat: Category) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status indicator line */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <span>
            Showing <strong className="text-foreground">{filteredItems.length}</strong> {activeTab === "lost" ? "lost" : activeTab === "found" ? "found" : "total"} items
          </span>
          <span className="text-[11px]">
            {activeTab === "lost" && "Showing items reported missing"}
            {activeTab === "found" && "Showing items available for claim"}
            {activeTab === "all" && "Showing both lost and found records"}
          </span>
        </div>
      </div>

      {/* Grid of Items */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item: Item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-2xl border-dashed bg-muted/20 space-y-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            {activeTab === "lost" ? (
              <Search className="w-6 h-6 text-rose-500" />
            ) : activeTab === "found" ? (
              <Package className="w-6 h-6 text-emerald-500" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-lg font-semibold">
            {activeTab === "lost"
              ? "No Lost Items Found"
              : activeTab === "found"
              ? "No Found Items Available"
              : "No Items Matched Your Search"}
          </h2>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto">
            {searchTerm || category !== "all"
              ? "Try adjusting your search terms or category filter to view more results."
              : activeTab === "lost"
              ? "No items are currently listed as lost."
              : "No found items have been approved yet. If you recently reported an item, check your User Dashboard or Admin approvals."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild size="sm">
              <Link href="/report">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Report Lost or Found Item
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
