import Link from 'next/link';
import type { Item } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`} className="group block h-full">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 border bg-card">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-muted overflow-hidden flex items-center justify-center">
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
        </CardHeader>
        <CardContent className="p-4 flex-grow space-y-2">
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
          <CardTitle className="text-base font-bold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </CardDescription>
        </CardContent>
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
