'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useItems, authStore } from '@/lib/items-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  User,
  LogIn,
  UserPlus,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Search,
  Package,
  IdCard,
} from 'lucide-react';
import { Logo } from './logo';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { currentUser, adminUser } = useItems();
  const router = useRouter();
  const { toast } = useToast();

  const handleUserLogout = () => {
    authStore.logoutUser();
    toast({
      title: 'Signed Out',
      description: 'You have been logged out.',
    });
    router.replace('/');
  };

  const handleAdminLogout = () => {
    authStore.logoutAdmin();
    toast({
      title: 'Admin Signed Out',
      description: 'You have logged out of the Admin Portal.',
    });
    router.replace('/admin/login');
  };

  const isAuthenticated = Boolean(currentUser || adminUser);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80 text-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Left: Logo & Lost and Found Title */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3">
            <Logo size="sm" />
            <div className="hidden sm:flex flex-col border-l border-slate-700 pl-3">
              <span className="text-sm font-bold tracking-tight text-white leading-none">
                Lost and Found Hub
              </span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                Ashoka Institute of Technology & Management
              </span>
            </div>
          </Link>

          {/* Navigation links: ONLY shown when user or admin is logged in */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium ml-4">
              <Link
                href="/?tab=lost"
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800/60 transition-colors inline-flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-rose-400" />
                <span>Lost Items</span>
              </Link>
              <Link
                href="/?tab=found"
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800/60 transition-colors inline-flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>Found Items</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800/60 transition-colors inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                <span>Dashboard</span>
              </Link>
            </nav>
          )}

          {adminUser && !currentUser && (
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium ml-4">
              <Link
                href="/admin"
                className="inline-flex items-center text-slate-300 hover:text-white transition-colors gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-800/60"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Dashboard</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Actions depending on Auth State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* If NOT logged in: Display Register, Student Login, and Admin Login */}
          {!isAuthenticated && (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5"
              >
                <Link href="/signup">
                  <UserPlus className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>Register</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary/50 bg-primary/10 text-primary-foreground hover:bg-primary/20 text-xs font-semibold px-2.5 sm:px-3 py-1.5"
              >
                <Link href="/login">
                  <LogIn className="w-3.5 h-3.5 mr-1 text-primary" />
                  <span>Sign In</span>
                </Link>
              </Button>


            </>
          )}

          {/* When Student is logged in */}
          {currentUser && (
            <>
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs"
              >
                <Link href="/report">
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  Report Item
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40 h-9 w-9 p-0 flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105"
                    title={currentUser.name}
                  >
                    <span className="uppercase">
                      {currentUser.name ? currentUser.name.trim().charAt(0) : 'U'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 bg-slate-900 text-slate-100 border-slate-800 shadow-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-semibold leading-none text-white">{currentUser.name}</p>
                      <p className="text-xs leading-none text-slate-400 truncate">{currentUser.email}</p>
                      {currentUser.studentId && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[11px] font-mono font-medium text-primary">
                          <IdCard className="w-3 h-3" />
                          <span>{currentUser.studentId}</span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem asChild className="focus:bg-slate-800 cursor-pointer">
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                      User Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-slate-800 cursor-pointer">
                    <Link href="/report" className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4 text-emerald-400" />
                      Report New Item
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem
                    onClick={handleUserLogout}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* When Admin is logged in */}
          {adminUser && !currentUser && (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs"
              >
                <Link href="/admin">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Admin Dashboard
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleAdminLogout}
                className="text-slate-400 hover:text-red-400 text-xs gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Admin
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
