'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useItems } from '@/lib/items-store';
import { items as seedItems } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Calendar,
  Tag,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Clock,
  Mail,
  Phone,
  User,
  IdCard,
  MessageCircle,
  Send,
  PhoneCall,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params safely for Next.js 15+
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  const { items, addClaim } = useItems();
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Look in reactive items store first, then fallback to seed items
  const item =
    items.find((i) => String(i.id) === String(itemId)) ||
    seedItems.find((i) => String(i.id) === String(itemId));

  if (!item) {
    return (
      <div className="container mx-auto max-w-2xl py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">Item Not Found</h2>
        <p className="text-muted-foreground">The requested item could not be located or may have been deleted.</p>
        <Button asChild>
          <Link href="/">Back to Public Catalog</Link>
        </Button>
      </div>
    );
  }

  const isPublic = item.isPublic !== false && item.moderationStatus === 'approved';
  const isFoundItem = item.status === 'found';
  const isLostItem = item.status === 'lost';

  // Build contact fields from item's reporter info
  const reporterName = item.reporterName;
  const reporterContact = item.reporterContact; // email or student ID stored here

  // --- Aliases used by the "found" panel (finder) ---
  const finderName = reporterName;
  const finderContact = reporterContact;
  // Detect if contact looks like an email
  const isEmail = finderContact && finderContact.includes('@');
  const finderEmail = isEmail ? finderContact : null;
  // Phone detection: starts with + or digits
  const isPhone = finderContact && /^[\+0-9]/.test(finderContact.replace(/\s/g, ''));
  const finderPhone = !isEmail && isPhone ? finderContact : null;
  // Student ID (fallback)
  const finderStudentId =
    !isEmail && !isPhone && finderContact ? finderContact : null;

  const hasContactInfo = reporterName || finderEmail || finderPhone || finderStudentId;

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Details Required',
        description: 'Please describe specific proof of ownership so the admin can verify.',
      });
      return;
    }

    setIsSubmittingClaim(true);
    try {
      addClaim({
        itemId: item.id,
        userId: 'user-current',
        status: 'pending',
        message: claimMessage.trim(),
      });

      setClaimSubmitted(true);
      setDialogOpen(false);
      setClaimMessage('');

      toast({
        title: 'Claim Submitted Successfully!',
        description: 'Your proof of ownership has been sent to the Admin Dashboard for review.',
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Failed to Submit Claim',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4 space-y-6">
      {/* Back Button */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Item Image Card */}
        <div className="flex items-start justify-center">
          <Card className="overflow-hidden w-full border bg-card shadow-sm">
            <div className="relative aspect-square w-full bg-muted flex items-center justify-center overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground text-sm">No Image Available</div>
              )}
            </div>
          </Card>
        </div>

        {/* Details & Action Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={item.status === 'lost' ? 'destructive' : 'secondary'}
                className="capitalize font-bold px-3 py-1"
              >
                {item.status === 'lost' ? '🔍 Lost Item' : '🎁 Found Item'}
              </Badge>

              {isPublic ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-xs">
                  <Globe className="w-3 h-3 mr-1" /> Publicly Listed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 bg-amber-50 text-xs">
                  <Clock className="w-3 h-3 mr-1" /> Pending Admin Review
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{item.name}</h1>
          </div>

          <p className="text-muted-foreground text-base leading-relaxed bg-muted/30 p-4 rounded-xl border">
            {item.description}
          </p>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <Tag className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground block">Category</span>
                <span className="font-semibold">{item.category?.name || 'General'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground block">Location</span>
                <span className="font-semibold">{item.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card sm:col-span-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground block">Date Reported</span>
                <span className="font-semibold">{item.date}</span>
              </div>
            </div>
          </div>

          {/* ── Contact the Reporter Panel (Lost items only) ── */}
          {isLostItem && isPublic && hasContactInfo && (
            <div className="rounded-2xl border-2 border-rose-400/40 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20 p-5 space-y-4 shadow-sm">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-rose-800 dark:text-rose-300">
                    Contact the Reporter
                  </h3>
                  <p className="text-[11px] text-rose-700/70 dark:text-rose-400/70">
                    Reach out to the person who reported this item lost
                  </p>
                </div>
              </div>

              <Separator className="bg-rose-200 dark:bg-rose-800" />

              {/* Reporter Details */}
              <div className="space-y-2.5">
                {reporterName && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Reporter&apos;s Name</span>
                      <span className="font-semibold text-foreground">{reporterName}</span>
                    </div>
                  </div>
                )}

                {finderEmail && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-muted-foreground block">Email Address</span>
                      <a
                        href={`mailto:${finderEmail}?subject=I Found Your ${encodeURIComponent(item.name)}&body=Hi ${reporterName || 'there'},%0A%0AI saw your lost item report for "${item.name}" at ${item.location}. I think I may have found it and would like to help return it.%0A%0AThank you!`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {finderEmail}
                      </a>
                    </div>
                  </div>
                )}

                {finderPhone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Phone Number</span>
                      <a
                        href={`tel:${finderPhone}`}
                        className="font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        {finderPhone}
                      </a>
                    </div>
                  </div>
                )}

                {finderStudentId && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <IdCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Student ID / Contact</span>
                      <span className="font-semibold font-mono text-foreground">{finderStudentId}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {finderEmail && (
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm gap-2"
                  >
                    <a
                      href={`mailto:${finderEmail}?subject=I Found Your ${encodeURIComponent(item.name)}&body=Hi ${reporterName || 'there'},%0A%0AI saw your lost item report for "${item.name}" at ${item.location}. I think I may have found it and would like to help return it.%0A%0AThank you!`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Email
                    </a>
                  </Button>
                )}

                {finderPhone && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 border-violet-300 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 font-semibold gap-2"
                  >
                    <a href={`tel:${finderPhone}`}>
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Reporter
                    </a>
                  </Button>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                💡 <strong>Tip:</strong> When contacting the reporter, mention where and when you found the item so they can verify it&apos;s theirs.
              </p>
            </div>
          )}

          {/* ── Contact the Finder Panel (Found items only) ── */}
          {isFoundItem && isPublic && hasContactInfo && (
            <div className="rounded-2xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 p-5 space-y-4 shadow-sm">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    Contact the Finder
                  </h3>
                  <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70">
                    Reach out directly to arrange the return of your item
                  </p>
                </div>
              </div>

              <Separator className="bg-emerald-200 dark:bg-emerald-800" />

              {/* Finder Details */}
              <div className="space-y-2.5">
                {finderName && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Finder&apos;s Name</span>
                      <span className="font-semibold text-foreground">{finderName}</span>
                    </div>
                  </div>
                )}

                {finderEmail && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-muted-foreground block">Email Address</span>
                      <a
                        href={`mailto:${finderEmail}?subject=Regarding Found Item: ${encodeURIComponent(item.name)}&body=Hi ${finderName || 'there'},%0A%0AI saw that you found a "${item.name}" at ${item.location} on ${item.date}. I believe this belongs to me and would like to arrange a return.%0A%0AThank you!`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {finderEmail}
                      </a>
                    </div>
                  </div>
                )}

                {finderPhone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Phone Number</span>
                      <a
                        href={`tel:${finderPhone}`}
                        className="font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        {finderPhone}
                      </a>
                    </div>
                  </div>
                )}

                {finderStudentId && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <IdCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Student ID / Contact</span>
                      <span className="font-semibold font-mono text-foreground">{finderStudentId}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {finderEmail && (
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm gap-2"
                  >
                    <a
                      href={`mailto:${finderEmail}?subject=Regarding Found Item: ${encodeURIComponent(item.name)}&body=Hi ${finderName || 'there'},%0A%0AI saw that you found a "${item.name}" at ${item.location} on ${item.date}. I believe this belongs to me and would like to arrange a return.%0A%0AThank you!`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Email
                    </a>
                  </Button>
                )}

                {finderPhone && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 border-violet-300 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 font-semibold gap-2"
                  >
                    <a href={`tel:${finderPhone}`}>
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Finder
                    </a>
                  </Button>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                💡 <strong>Tip:</strong> When contacting the finder, mention specific details about your item (color, brand, unique markings) so they can verify you are the rightful owner.
              </p>
            </div>
          )}

          {/* Fallback if found item but no contact info yet */}
          {isFoundItem && isPublic && !hasContactInfo && (
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Contact info not available
              </p>
              <p className="text-[11px] text-muted-foreground">
                The finder did not provide contact details. Use the claim button below to notify the admin.
              </p>
            </div>
          )}

          {claimSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Your claim has been submitted to the Admin. You will be notified once reviewed.</span>
            </div>
          )}

          {item.status === 'found' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-base font-semibold py-6 border-2"
                >
                  Submit Formal Ownership Claim
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleClaimSubmit}>
                  <DialogHeader>
                    <DialogTitle>Claim Item: {item.name}</DialogTitle>
                    <DialogDescription>
                      To formally claim this item, please provide specific details only the true owner would know (e.g. serial numbers, wallpaper, unique scratches). This will be reviewed by the admin.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid w-full gap-2">
                      <Label htmlFor="claim-proof" className="font-semibold text-sm">
                        Identifying Proof / Details *
                      </Label>
                      <Textarea
                        id="claim-proof"
                        placeholder="e.g. 'The scratch on the top corner, sticker inside the case, or passcode hint.'"
                        rows={4}
                        value={claimMessage}
                        onChange={(e) => setClaimMessage(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmittingClaim}>
                      {isSubmittingClaim ? 'Submitting...' : 'Submit Claim'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
