import { Suspense } from 'react';
import HomeClient from "@/components/HomeClient";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-muted-foreground">Loading items catalog...</div>}>
      <HomeClient />
    </Suspense>
  );
}
