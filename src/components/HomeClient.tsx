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

  // If NOT logged in (and not admin): Show centered Student Login page
  if (!currentUser && !adminUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-background via-muted/20 to-muted/40">
        <div className="w-full max-w-md space-y-4">
          <Card className="shadow-2xl border-primary/20 bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-3 pb-4">
              {/* College Logo */}
              <div className="flex justify-center mb-1">
                <Logo size="lg" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Student & Member Portal</span>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Student Sign In
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Enter your Gmail address or Student ID and password to access the Lost & Found portal.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                {/* Identifier Address or ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="identifier" className="font-semibold text-xs text-foreground flex items-center justify-between">
                    <span>Gmail Address or Student ID</span>
                    <span className="text-[11px] text-muted-foreground font-normal">e.g. ASH-2024-001</span>
                  </Label>
                  <Input
                    id="identifier"
                    placeholder="student@ashoka.com or ASH-2024-001"
                    className="h-10"
                    {...register("identifier")}
                  />
                  {errors.identifier && (
                    <p className="text-destructive text-xs font-medium">{errors.identifier.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="font-semibold text-xs text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-10"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit & Register Buttons Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <Button
                    type="submit"
                    className="w-full font-semibold py-5 shadow-sm text-xs bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
                    disabled={isSubmitting}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {isSubmitting ? "Signing in..." : "Sign In"}
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

              {/* Quick Login Helper */}
              <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Quick Logins:</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleQuickFill}
                    className="h-7 text-[11px] text-primary hover:text-primary/80 hover:bg-primary/10 px-2"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Fill Gmail
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleQuickFillId}
                    className="h-7 text-[11px] text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 px-2"
                  >
                    <IdCard className="w-3 h-3 mr-1" />
                    Fill Student ID
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/30 border-t p-4 flex flex-col gap-2.5 text-center">
              <div className="w-full flex items-center justify-center text-xs">
                <span className="text-muted-foreground mr-1.5">Need a Student ID?</span>
                <Link href="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
                  Create Account here
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="w-full flex items-center justify-center pt-2 border-t border-muted/80">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Administrator / Faculty Login Portal →
                </Link>
              </div>
            </CardFooter>
          </Card>
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
            <Button asChild variant="outline" size="default">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                My Dashboard
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
