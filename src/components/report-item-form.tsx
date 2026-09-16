'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { generateItemDescription } from '@/ai/flows/generate-item-description';
import { itemsStore, useItems } from '@/lib/items-store';
import { categories } from '@/lib/data';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  Wand2,
  Loader2,
  Info,
  CheckCircle2,
  Image as ImageIcon,
  X,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters.'),
  description: z.string().min(8, 'Description must be at least 8 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  location: z.string().min(2, 'Location must be at least 2 characters.'),
  status: z.enum(['lost', 'found'], {
    required_error: 'You need to select a status.',
  }),
  reporterName: z.string().optional(),
  reporterContact: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Client-side image compressor:
 * Resizes large smartphone images to max 900x900 JPEG/WebP data URI
 * Keeps payload lightweight and avoids localStorage overflow.
 */
function compressImage(file: File): Promise<{ dataUrl: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: img.src, originalSize: file.size, compressedSize: file.size });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        const compressedSize = Math.round((dataUrl.length * 3) / 4);
        resolve({ dataUrl, originalSize: file.size, compressedSize });
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

export function ReportItemForm() {
  const { currentUser } = useItems();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
  const [submittedItemId, setSubmittedItemId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      location: '',
      status: 'lost',
      reporterName: currentUser?.name || '',
      reporterContact: currentUser?.phone || currentUser?.studentId || currentUser?.email || '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      if (!form.getValues('reporterName')) {
        form.setValue('reporterName', currentUser.name);
      }
      if (!form.getValues('reporterContact')) {
        form.setValue(
          'reporterContact',
          currentUser.phone || (currentUser.studentId ? `ID: ${currentUser.studentId}` : currentUser.email)
        );
      }
    }
  }, [currentUser, form]);

  const processFile = useCallback(async (file: File) => {
    setImageError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file (.jpg, .png, .webp)');
      return;
    }

    try {
      const { dataUrl } = await compressImage(file);
      setPreview(dataUrl);
      setImageFile(file);
    } catch (err) {
      console.error('Error processing image:', err);
      // Fallback to simple FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setImageFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateDescription = async () => {
    if (!preview) {
      toast({
        variant: 'destructive',
        title: 'Image Required for AI Description',
        description: 'Please upload a photo of the item first so AI can describe it.',
      });
      return;
    }

    setIsGenerating(true);
    setSuggestedDescription('');

    try {
      const selectedCategoryObj = categories.find((c) => c.id === form.getValues('category'));
      const result = await generateItemDescription({
        photoDataUri: preview,
        itemName: form.getValues('name'),
        category: selectedCategoryObj?.name,
        status: form.getValues('status'),
      });

      if (result.suggestedDescription) {
        setSuggestedDescription(result.suggestedDescription);
        // Automatically fill if description is empty, or show suggestion alert
        const currentDesc = form.getValues('description');
        if (!currentDesc || currentDesc.trim().length === 0) {
          form.setValue('description', result.suggestedDescription, { shouldValidate: true });
        }
        toast({
          title: 'Description Ready!',
          description: 'AI generated a description for your item.',
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      // Even if an unexpected error occurs, provide a helpful fallback
      const fallback = `Item reported in ${form.getValues('location') || 'the area'}. Showing identifiable features corresponding with the uploaded image.`;
      setSuggestedDescription(fallback);
      if (!form.getValues('description')) {
        form.setValue('description', fallback, { shouldValidate: true });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: FormValues) {
    if (!preview) {
      setImageError('Please upload a photo of the item.');
      toast({
        variant: 'destructive',
        title: 'Photo Required',
        description: 'Please attach a photo of the item before submitting.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategory = categories.find((c) => c.id === values.category) || {
        id: values.category,
        name: values.category,
      };

      const newItem = itemsStore.add({
        name: values.name.trim(),
        description: values.description.trim(),
        category: selectedCategory,
        status: values.status,
        location: values.location.trim(),
        date: new Date().toISOString().split('T')[0],
        imageUrl: preview,
        imageHint: values.name.trim(),
        userId: 'user-current',
        isPublic: false, // Pending admin approval
        moderationStatus: 'pending',
        reporterName: values.reporterName?.trim() || 'Anonymous Reporter',
        reporterContact: values.reporterContact?.trim() || '',
      });

      setSubmittedItemId(newItem.id);
      setIsSuccessSubmitted(true);

      toast({
        title: 'Report Submitted Successfully!',
        description: 'Your item has been sent to the Admin Dashboard for review and public approval.',
      });
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'An error occurred while saving your item. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleResetForm = () => {
    form.reset();
    handleRemoveImage();
    setSuggestedDescription('');
    setIsSuccessSubmitted(false);
    setSubmittedItemId(null);
  };

  if (isSuccessSubmitted) {
    return (
      <Card className="border-primary/20 bg-card shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Report Submitted Successfully!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your reported item has been safely recorded and routed to the <strong>Admin Dashboard</strong>. Once the admin reviews and approves it, it will become publicly visible in the search catalog.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/60 border text-left max-w-md mx-auto space-y-2 text-sm">
            <div className="flex items-center gap-2 text-primary font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Moderation Status: Pending Admin Review</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You can track or approve this item directly from the Admin Dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 flex-wrap">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              View My Dashboard
            </Button>
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-amber-500" />
              Admin Moderation
            </Button>
            <Button variant="secondary" onClick={handleResetForm}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Report Another Item
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Status Selector: Lost vs Found */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">
                    Is this item lost or found? *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="lost" />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel className="font-semibold cursor-pointer">
                            🔍 I lost an item
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Report an item you are looking for
                          </FormDescription>
                        </div>
                      </FormItem>

                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="found" />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel className="font-semibold cursor-pointer">
                            🎁 I found an item
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Report an item you discovered
                          </FormDescription>
                        </div>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Item Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Black Top / Bose Headphones / Silver Watch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seamless Image Upload Dropzone */}
            <div className="space-y-2">
              <label className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Photo of the item *
              </label>

              {preview ? (
                <div className="relative rounded-xl border-2 border-primary/40 bg-muted/30 p-3 overflow-hidden">
                  <div className="relative h-64 w-full flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
                    <img
                      src={preview}
                      alt="Item preview"
                      className="max-h-64 max-w-full object-contain rounded-md"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                      <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{imageFile?.name || 'Image uploaded'}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-primary bg-primary/10 scale-[0.99]'
                      : 'border-muted-foreground/30 bg-muted/40 hover:bg-muted/70 hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <div className="p-3 bg-background rounded-full shadow-sm text-primary">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        High resolution camera photos, JPG, PNG, WEBP automatically optimized
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                id="photo-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {imageError && (
                <p className="text-sm font-medium text-destructive">{imageError}</p>
              )}
            </div>

            {/* Description & AI Generator */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold">Description *</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating || !preview}
                      className="text-xs h-8 border-purple-500/30 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details like color, brand, distinct markings, or condition."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI Suggestion Banner */}
            {suggestedDescription && (
              <Alert className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertTitle className="text-purple-900 dark:text-purple-300 font-semibold text-xs">
                  AI Suggestion Generated
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground mt-1 space-y-2">
                  <p>{suggestedDescription}</p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-purple-700 dark:text-purple-400 font-semibold"
                    onClick={() => form.setValue('description', suggestedDescription, { shouldValidate: true })}
                  >
                    Apply AI Description to Form
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Last Known Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Near Lalkula / Library 2nd Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <FormField
                control={form.control}
                name="reporterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Your Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reporterContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Contact Email / Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., alex@example.com / phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full text-base font-semibold py-6 shadow-md"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving & Submitting Report...
                </>
              ) : (
                'Submit Report to Admin'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
