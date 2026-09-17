import Link from 'next/link';
import type { Item } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

/** Generate a consistent avatar colour from a name string */
function nameToColor(name: string): string {
  const colors = [
    'bg-rose-500',
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Returns initials (up to 2 chars) from a full name */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ItemCard({ item }: ItemCardProps) {
  const reporterName = item.reporterName;
  const initials = reporterName ? getInitials(reporterName) : null;
  const avatarColor = reporterName ? nameToColor(reporterName) : 'bg-muted';

  return (
    <Link href={`/items/${item.id}`} className="group block h-full">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 border bg-card">

        {/* ── Instagram-style poster header ── */}
        {reporterName && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b bg-card">
            {/* Avatar circle with initials */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${avatarColor}`}
            >
              {initials}
            </div>

            {/* Name + role label */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-foreground leading-tight truncate">
                {reporterName}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {item.status === 'lost' ? 'Reported Lost' : 'Reported Found'}
              </p>
            </div>

            {/* Status badge */}
            <Badge
              variant={item.status === 'lost' ? 'destructive' : 'secondary'}
              className="capitalize text-[10px] font-semibold shrink-0"
            >
              {item.status}
            </Badge>
          </div>
        )}

        {/* ── Item image ── */}
        <div className="relative h-44 w-full bg-muted overflow-hidden flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground text-xs font-medium">No Image Provided</div>
          )}
        </div>

        {/* ── Item details ── */}
        <CardContent className="p-4 flex-grow space-y-1.5">
          {/* Show category row only when there's no reporter header (fallback) */}
          {!reporterName && (
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs text-muted-foreground font-medium truncate">
                {item.category?.name || 'General'}
              </span>
              <Badge
                variant={item.status === 'lost' ? 'destructive' : 'secondary'}
                className="capitalize text-[11px] font-semibold"
              >
                {item.status}
              </Badge>
            </div>
          )}

          {/* Category label when header is present */}
          {reporterName && (
            <span className="text-[11px] text-muted-foreground font-medium">
              {item.category?.name || 'General'}
            </span>
          )}

          <CardTitle className="text-base font-bold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </CardDescription>
        </CardContent>

        {/* ── Footer: location + date ── */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground border-t bg-muted/20">
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3" />
            <span>{item.date}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
