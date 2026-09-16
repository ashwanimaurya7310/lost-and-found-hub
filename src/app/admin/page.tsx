'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useItems, authStore, fetchServerData } from '@/lib/items-store';
import type { Item, Claim } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Archive,
  Search,
  Check,
  X,
  Globe,
  EyeOff,
  Eye,
  Clock,
  Trash2,
  ShieldCheck,
  PlusCircle,
  LogOut,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  AlertTriangle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const {
    items,
    claims,
    adminUser,
    isAdmin,
    isLoaded,
    setModerationStatus,
    updateItem,
    deleteItem,
    updateClaimStatus,
  } = useItems();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Protect Admin Dashboard: If not authenticated as admin, redirect to admin login
  useEffect(() => {
    if (isLoaded && (!adminUser || adminUser.role !== 'admin')) {
      router.replace('/admin/login');
    }
  }, [isLoaded, adminUser, router]);

  const totalItems = items.length;
  const lostItems = items.filter((item) => item.status === 'lost').length;
  const foundItems = items.filter((item) => item.status === 'found').length;
  const pendingApprovals = items.filter(
    (item) => item.moderationStatus === 'pending' || item.isPublic === false
  );
  const pendingClaims = claims.filter((claim) => claim.status === 'pending').length;

  // Dynamic category breakdown data for the analytics chart
  const categoriesList = ['Electronics', 'Books', 'Clothing', 'Accessories', 'Other'];
  const chartData = categoriesList.map((catName) => {
    const lost = items.filter(
      (item) =>
        item.status === 'lost' &&
        (item.category?.name?.toLowerCase() === catName.toLowerCase() ||
          item.category?.id?.toLowerCase() === catName.toLowerCase())
    ).length;

    const found = items.filter(
      (item) =>
        item.status === 'found' &&
        (item.category?.name?.toLowerCase() === catName.toLowerCase() ||
          item.category?.id?.toLowerCase() === catName.toLowerCase())
    ).length;

    return { name: catName, lost, found };
  });

  const handleAdminLogout = () => {
    authStore.logoutAdmin();
    toast({
      title: 'Admin Signed Out',
      description: 'You have logged out of the Admin Portal.',
    });
    router.replace('/admin/login');
  };

  const handleMakePublic = (item: Item) => {
    setModerationStatus(item.id, 'approved', true);
    toast({
      title: 'Item Approved & Published!',
      description: `"${item.name}" is now live on the public catalog.`,
    });
  };

  const handleHideItem = (item: Item) => {
    updateItem(item.id, { isPublic: false });
    toast({
      title: 'Item Hidden',
      description: `"${item.name}" has been hidden from the public catalog.`,
    });
  };

  const handleRejectItem = (item: Item) => {
    setModerationStatus(item.id, 'rejected', false);
    toast({
      variant: 'destructive',
      title: 'Item Rejected',
      description: `"${item.name}" was rejected.`,
    });
  };

  const handleDeleteItem = (item: Item) => {
    if (confirm(`Are you sure you want to permanently delete "${item.name}"?`)) {
      deleteItem(item.id);
      if (selectedItem?.id === item.id) {
        setPreviewOpen(false);
      }
      toast({
        title: 'Item Permanently Deleted',
        description: `"${item.name}" was removed from the database.`,
      });
    }
  };

  const handleClaimAction = (claimId: string, status: 'approved' | 'rejected') => {
    updateClaimStatus(claimId, status);
    toast({
      title: `Claim ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `Claim status updated to ${status}.`,
    });
  };

  const openPreview = (item: Item) => {
    setSelectedItem(item);
    setPreviewOpen(true);
  };

  if (!isLoaded || !adminUser || adminUser.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-sm">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Verifying admin access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Top Header with Admin Session Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Admin Moderation Dashboard</h2>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
              Staff Portal
            </Badge>
          </div>
          <p className="text-slate-400 text-xs md:text-sm">
            Review user reports, inspect full reporter contact info, approve items for public listing, and verify claims.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetchServerData();
              toast({
                title: 'Data Synchronized',
                description: 'Latest reports and claims fetched from server.',
              });
            }}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs"
            title="Fetch latest updates from all devices"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-emerald-400 animate-spin-hover" />
            <span>Live Sync</span>
          </Button>

          <Button asChild variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white">
            <Link href="/">
              <Globe className="mr-1.5 h-4 w-4" />
              Public Catalog
            </Link>
          </Button>

          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-sm">
            <Link href="/report">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Add Item
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdminLogout}
            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out Admin
          </Button>
        </div>
      </div>

      {/* Admin Metrics Row (All initial counts reflect real data) */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {/* Pending Approvals */}
        <Card className="border-amber-300 dark:border-amber-800/60 shadow-sm bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingApprovals.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin publication</p>
          </CardContent>
        </Card>

        {/* Total Items */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">In database</p>
          </CardContent>
        </Card>

        {/* Lost Items */}
        <Card className="border-destructive/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-destructive">Lost Items</CardTitle>
            <Search className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-destructive">{lostItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Reported lost by users</p>
          </CardContent>
        </Card>

        {/* Found Items */}
        <Card className="border-emerald-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Found Items
            </CardTitle>
            <Search className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {foundItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Found & reported</p>
          </CardContent>
        </Card>

        {/* Pending Claims */}
        <Card className="border-blue-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Pending Claims
            </CardTitle>
            <Check className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {pendingClaims}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ownership verification needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs for Moderation */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="pending" className="relative">
            Pending Review
            {pendingApprovals.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingApprovals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* TAB 1: PENDING APPROVALS */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="border-amber-200/60 dark:border-amber-900/40">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Items Awaiting Admin Approval
                </CardTitle>
                <CardDescription>
                  Review submitted details, check reporter information, and make items public on the campus catalog.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-14 border rounded-xl border-dashed bg-muted/20">
                  <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500/60 mb-2" />
                  <h3 className="font-semibold text-base">All Caught Up!</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No items currently pending moderation. When users submit new reports, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[70px]">Photo</TableHead>
                        <TableHead>Item Name & Details</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reporter Info</TableHead>
                        <TableHead>Location & Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/40">
                          <TableCell>
                            <div
                              onClick={() => openPreview(item)}
                              className="relative h-14 w-14 rounded-md overflow-hidden bg-muted cursor-pointer border hover:opacity-80 transition-opacity flex items-center justify-center"
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="text-[10px] text-muted-foreground">No Img</div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div
                              className="font-semibold text-foreground hover:underline cursor-pointer flex items-center gap-1.5"
                              onClick={() => openPreview(item)}
                            >
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                              {item.description}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={item.status === 'lost' ? 'destructive' : 'secondary'}
                              className="capitalize font-semibold text-xs"
                            >
                              {item.status === 'lost' ? '🔍 Lost' : '🎁 Found'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs">{item.category?.name || 'General'}</TableCell>

                          <TableCell>
                            <div className="text-xs font-medium text-foreground">
                              {item.reporterName || 'Anonymous'}
                            </div>
                            {item.reporterContact && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-primary" />
                                <span>{item.reporterContact}</span>
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="text-xs font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {item.location}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {item.date}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5"
                                onClick={() => handleMakePublic(item)}
                              >
                                <Globe className="mr-1 h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 px-2.5"
                                onClick={() => openPreview(item)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Inspect
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                onClick={() => handleRejectItem(item)}
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ALL ITEMS */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">All Registered Items</CardTitle>
              <CardDescription>
                Full directory of all lost and found items. You can toggle public visibility, inspect details, or remove entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-14 border rounded-xl border-dashed bg-muted/20">
                  <Archive className="mx-auto h-12 w-12 text-muted-foreground/60 mb-2" />
                  <h3 className="font-semibold text-base">No Items in Database</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    The database is currently clean (0 items). When users report items, they will be listed here.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px]">Photo</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Controls</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const isPublic = item.isPublic !== false && item.moderationStatus === 'approved';
                        return (
                          <TableRow key={item.id} className="hover:bg-muted/40">
                            <TableCell>
                              <div
                                onClick={() => openPreview(item)}
                                className="relative h-12 w-12 rounded-md overflow-hidden bg-muted cursor-pointer border flex items-center justify-center"
                              >
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">N/A</span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="font-semibold text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.date}</div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={item.status === 'lost' ? 'destructive' : 'secondary'}
                                className="capitalize text-xs font-medium"
                              >
                                {item.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs">{item.category?.name || 'General'}</TableCell>

                            <TableCell>
                              {isPublic ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-[11px] gap-1">
                                  <Globe className="w-3 h-3" /> Public
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[11px] gap-1">
                                  <EyeOff className="w-3 h-3" /> Hidden / Pending
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="text-xs">{item.reporterName || 'Anonymous'}</div>
                              {item.reporterContact && (
                                <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                  {item.reporterContact}
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="text-xs">{item.location}</TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isPublic ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 px-2"
                                    onClick={() => handleHideItem(item)}
                                  >
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Hide
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2"
                                    onClick={() => handleMakePublic(item)}
                                  >
                                    <Globe className="h-3 w-3 mr-1" />
                                    Make Public
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => openPreview(item)}
                                  title="View Full Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
                                  onClick={() => handleDeleteItem(item)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CLAIMS */}
        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">User Ownership Claims</CardTitle>
              <CardDescription>
                Review submitted proof of ownership for found items. Approve legitimate claims to notify students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <div className="text-center py-14 border rounded-xl border-dashed bg-muted/20">
                  <Check className="mx-auto h-12 w-12 text-muted-foreground/60 mb-2" />
                  <h3 className="font-semibold text-base">No Claims Submitted</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    When users claim found items from the catalog, their proof and contact details will appear here.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Target Item</TableHead>
                        <TableHead>Claimant ID / Email</TableHead>
                        <TableHead>Claim Message / Proof Details</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claims.map((claim) => {
                        const targetItem = items.find((i) => String(i.id) === String(claim.itemId));
                        return (
                          <TableRow key={claim.id}>
                            <TableCell>
                              <div className="font-semibold text-sm">
                                {targetItem?.name || `Item #${claim.itemId}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {targetItem?.location || 'Unknown location'}
                              </div>
                            </TableCell>

                            <TableCell className="text-xs font-medium">
                              {claim.userId}
                            </TableCell>

                            <TableCell className="text-xs max-w-sm">
                              <div className="p-2 rounded bg-muted/40 border text-foreground">
                                {claim.message || 'No description provided.'}
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">{claim.date}</TableCell>

                            <TableCell>
                              <Badge
                                variant={
                                  claim.status === 'pending'
                                    ? 'outline'
                                    : claim.status === 'approved'
                                    ? 'default'
                                    : 'destructive'
                                }
                                className="capitalize text-xs font-semibold"
                              >
                                {claim.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              {claim.status === 'pending' ? (
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                                    onClick={() => handleClaimAction(claim.id, 'approved')}
                                  >
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleClaimAction(claim.id, 'rejected')}
                                  >
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground font-medium">Resolved</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ANALYTICS & CHARTS */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items Overview by Category</CardTitle>
              <CardDescription>Live breakdown of lost vs. found items by category.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lost" fill="hsl(var(--destructive))" name="Lost Items" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="found" fill="hsl(var(--primary))" name="Found Items" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comprehensive Item Inspection Modal (Displays ALL details user entered) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={selectedItem.status === 'lost' ? 'destructive' : 'secondary'} className="capitalize font-bold">
                    {selectedItem.status === 'lost' ? '🔍 Lost Item' : '🎁 Found Item'}
                  </Badge>
                  {selectedItem.isPublic !== false && selectedItem.moderationStatus === 'approved' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-xs">
                      Publicly Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 bg-amber-50 text-xs">
                      Pending Admin Review
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl font-extrabold">{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  Database Record #{selectedItem.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Full Resolution Photo */}
                {selectedItem.imageUrl && (
                  <div className="relative h-64 w-full rounded-xl overflow-hidden bg-muted border flex items-center justify-center">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="h-full w-full object-contain bg-black/5"
                    />
                  </div>
                )}

                {/* Complete Item Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Full Description Submitted by User
                  </h4>
                  <p className="text-sm bg-muted/40 p-3.5 rounded-lg border text-foreground leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground block flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-primary" /> Category
                    </span>
                    <span className="font-semibold text-sm">{selectedItem.category?.name || 'General'}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Location Reported
                    </span>
                    <span className="font-semibold text-sm">{selectedItem.location}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Date Reported
                    </span>
                    <span className="font-semibold text-sm">{selectedItem.date}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Moderation Status
                    </span>
                    <span className="font-semibold text-sm capitalize">{selectedItem.moderationStatus || 'pending'}</span>
                  </div>
                </div>

                {/* Reporter Contact Information (Highlighted for Admin) */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> User Reporter Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Reporter Name:</span>
                      <span className="font-semibold text-sm text-foreground">
                        {selectedItem.reporterName || 'Anonymous Student'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Contact Info / Email:</span>
                      <span className="font-semibold text-sm text-foreground">
                        {selectedItem.reporterContact || selectedItem.userId || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </Button>
                {selectedItem.isPublic !== false && selectedItem.moderationStatus === 'approved' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleHideItem(selectedItem);
                      setPreviewOpen(false);
                    }}
                  >
                    <EyeOff className="mr-1.5 h-4 w-4" />
                    Hide from Catalog
                  </Button>
                ) : (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    onClick={() => {
                      handleMakePublic(selectedItem);
                      setPreviewOpen(false);
                    }}
                  >
                    <Globe className="mr-1.5 h-4 w-4" />
                    Approve & Make Public
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteItem(selectedItem)}
                  title="Delete Item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
