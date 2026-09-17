'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useItems, authStore } from '@/lib/items-store';
import type { Item } from '@/lib/types';
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
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  Globe,
  EyeOff,
  User,
  LogOut,
  ArrowRight,
  Package,
  Layers,
  ShieldCheck,
  ExternalLink,
  IdCard,
  Mail,
  Phone,
  Eye,
  MapPin,
  Calendar,
  Tag,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserDashboard() {
  const {
    myItems,
    myLostCount,
    myFoundCount,
    myClaims,
    currentUser,
    isLoaded,
  } = useItems();

  const router = useRouter();
  const { toast } = useToast();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [inspectOpen, setInspectOpen] = useState(false);

  // Protect User Dashboard: redirect to home/login if not signed in
  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.replace('/');
    }
  }, [isLoaded, currentUser, router]);

  const handleLogout = () => {
    authStore.logoutUser();
    toast({
      title: 'Signed Out',
      description: 'You have been logged out of your user account.',
    });
    router.replace('/');
  };

  const openInspect = (item: Item) => {
    setSelectedItem(item);
    setInspectOpen(true);
  };

  const totalReported = myItems.length;

  if (!isLoaded || !currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
      {/* User Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">
              <User className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </div>
            {currentUser?.studentId && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <IdCard className="w-3.5 h-3.5" />
                <span>ID: {currentUser.studentId}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            {currentUser ? `Welcome, ${currentUser.name}` : 'My Activity Dashboard'}
          </h1>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-0.5">
            {currentUser?.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-primary" />
                {currentUser.email}
              </span>
            )}
            {currentUser?.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {currentUser.phone}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/report">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Report New Item
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <Globe className="mr-1.5 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          )}
        </div>
      </div>

      {/* User Counter Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Items Reported */}
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Reported
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{totalReported}</div>
            <p className="text-xs text-muted-foreground mt-1">Items submitted by you</p>
          </CardContent>
        </Card>

        {/* Lost Items Count */}
        <Card className="border border-destructive/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-destructive">
              Lost Items
            </CardTitle>
            <Search className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-destructive">{myLostCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Items you are searching for</p>
          </CardContent>
        </Card>

        {/* Found Items Count */}
        <Card className="border border-emerald-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Found Items
            </CardTitle>
            <Package className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {myFoundCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Items you found &amp; reported</p>
          </CardContent>
        </Card>

        {/* Active Claims Count */}
        <Card className="border border-blue-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              My Claims
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {myClaims.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ownership claims submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for My Reports & My Claims */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="reports">
            My Reported Items ({myItems.length})
          </TabsTrigger>
          <TabsTrigger value="claims">
            My Claims ({myClaims.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: My Reported Items */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Items You Have Reported</CardTitle>
                  <CardDescription>
                    Review your full reporter details and moderation status. Once approved by the administrator, items become visible in the public catalog.
                  </CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/report">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Report Item
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myItems.length === 0 ? (
                <div className="text-center py-16 border rounded-xl border-dashed bg-muted/20 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-base">No Items Reported Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    You haven&apos;t reported any lost or found items yet. Submit your first report to see live counts and moderation updates.
                  </p>
                  <Button asChild size="sm" className="mt-2">
                    <Link href="/report">Report Lost or Found Item</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[70px]">Photo</TableHead>
                        <TableHead>Item Details</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reporter Info</TableHead>
                        <TableHead>Location &amp; Date</TableHead>
                        <TableHead>Admin Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myItems.map((item) => {
                        const isApproved =
                          item.isPublic !== false && item.moderationStatus === 'approved';
                        return (
                          <TableRow key={item.id} className="hover:bg-muted/40">
                            {/* Photo */}
                            <TableCell>
                              <div
                                className="relative h-12 w-12 rounded-md overflow-hidden bg-muted border flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openInspect(item)}
                                title="Click to inspect"
                              >
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">No Img</span>
                                )}
                              </div>
                            </TableCell>

                            {/* Item Name & Description */}
                            <TableCell>
                              <div
                                className="font-semibold text-sm hover:underline cursor-pointer"
                                onClick={() => openInspect(item)}
                              >
                                {item.name}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                {item.description}
                              </div>
                            </TableCell>

                            {/* Type */}
                            <TableCell>
                              <Badge
                                variant={item.status === 'lost' ? 'destructive' : 'secondary'}
                                className="capitalize text-xs font-semibold"
                              >
                                {item.status === 'lost' ? '🔍 Lost' : '🎁 Found'}
                              </Badge>
                            </TableCell>

                            {/* Category */}
                            <TableCell className="text-xs">
                              {item.category?.name || 'General'}
                            </TableCell>

                            {/* Reporter Info */}
                            <TableCell>
                              <div className="text-xs font-medium text-foreground">
                                {item.reporterName || currentUser?.name || 'You'}
                              </div>
                              {item.reporterContact ? (
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  {item.reporterContact.includes('@') ? (
                                    <Mail className="w-3 h-3 text-primary flex-shrink-0" />
                                  ) : (
                                    <Phone className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                  )}
                                  <span className="truncate max-w-[130px]">
                                    {item.reporterContact}
                                  </span>
                                </div>
                              ) : currentUser?.email ? (
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-primary flex-shrink-0" />
                                  <span className="truncate max-w-[130px]">{currentUser.email}</span>
                                </div>
                              ) : null}
                            </TableCell>


                            {/* Location & Date */}
                            <TableCell>
                              <div className="text-xs font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                {item.location}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                {item.date}
                              </div>
                            </TableCell>

                            {/* Admin Status */}
                            <TableCell>
                              {isApproved ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-xs gap-1">
                                  <Globe className="w-3 h-3" /> Publicly Approved
                                </Badge>
                              ) : item.moderationStatus === 'rejected' ? (
                                <Badge variant="destructive" className="text-xs">
                                  Rejected
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 bg-amber-50 text-xs gap-1">
                                  <Clock className="w-3 h-3" /> Awaiting Approval
                                </Badge>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs gap-1"
                                  onClick={() => openInspect(item)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Inspect
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                  <Link href={`/items/${item.id}`}>
                                    View <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
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

        {/* TAB 2: My Claims */}
        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Your Item Claims</CardTitle>
              <CardDescription>
                Track ownership claims you have submitted for found items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myClaims.length === 0 ? (
                <div className="text-center py-16 border rounded-xl border-dashed bg-muted/20 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-base">No Claims Submitted</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Found an item in the public catalog that belongs to you? Submit a claim with identifying details.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/">Browse Public Catalog</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Target Item ID</TableHead>
                        <TableHead>Submitted Proof</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium text-xs">Item #{claim.itemId}</TableCell>
                          <TableCell className="text-xs max-w-md">
                            <span className="text-muted-foreground">{claim.message}</span>
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
                              className="capitalize text-xs"
                            >
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                              <Link href={`/items/${claim.itemId}`}>
                                View Item <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
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
      </Tabs>

      {/* ── Full Item Inspect Dialog ── */}
      <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={selectedItem.status === 'lost' ? 'destructive' : 'secondary'}
                    className="capitalize font-bold"
                  >
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
                  Your Report ID: #{selectedItem.id}
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

                {/* Full Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Full Description
                  </h4>
                  <p className="text-sm bg-muted/40 p-3.5 rounded-lg border text-foreground leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-primary" /> Category
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedItem.category?.name || 'General'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Location Reported
                    </span>
                    <span className="font-semibold text-sm">{selectedItem.location}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Date Reported
                    </span>
                    <span className="font-semibold text-sm">{selectedItem.date}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Moderation Status
                    </span>
                    <span className="font-semibold text-sm capitalize">
                      {selectedItem.moderationStatus || 'pending'}
                    </span>
                  </div>
                </div>

                {/* Reporter Contact Information */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Reporter Contact Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Reporter Name:</span>
                      <span className="font-semibold text-sm text-foreground flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {selectedItem.reporterName || currentUser?.name || 'Anonymous Student'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">
                        {selectedItem.reporterContact?.includes('@') ? 'Email Address:' : 'Contact / Phone:'}
                      </span>
                      <span className="font-semibold text-sm text-foreground flex items-center gap-1 break-all">
                        {selectedItem.reporterContact?.includes('@') ? (
                          <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        ) : (
                          <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        )}
                        {selectedItem.reporterContact || currentUser?.email || 'Not provided'}
                      </span>
                    </div>
                    {currentUser?.studentId && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Student ID:</span>
                        <span className="font-semibold text-sm text-foreground flex items-center gap-1 font-mono">
                          <IdCard className="w-3.5 h-3.5 text-amber-600" />
                          {currentUser.studentId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setInspectOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link href={`/items/${selectedItem.id}`}>
                    <EyeOff className="w-4 h-4 mr-1.5" />
                    View Public Listing
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
