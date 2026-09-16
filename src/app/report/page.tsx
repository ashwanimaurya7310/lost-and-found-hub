import { ReportItemForm } from '@/components/report-item-form';

export default function ReportPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold">Report an Item</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the details below to report a lost or found item.
        </p>
      </div>
      <ReportItemForm />
    </div>
  );
}
