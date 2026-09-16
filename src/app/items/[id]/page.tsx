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
import { Calendar, Tag, MapPin, ArrowLeft, ShieldCheck, CheckCircle2, Globe, Clock } from 'lucide-react';
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

          {claimSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Your claim has been submitted to the Admin. You will be notified once reviewed.</span>
            </div>
          )}

          {item.status === 'found' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full text-base font-semibold shadow-md py-6">
                  Claim This Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleClaimSubmit}>
                  <DialogHeader>
                    <DialogTitle>Claim Item: {item.name}</DialogTitle>
                    <DialogDescription>
                      To claim this item, please provide specific details only the true owner would know (e.g. serial numbers, wallpaper, unique scratches).
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
