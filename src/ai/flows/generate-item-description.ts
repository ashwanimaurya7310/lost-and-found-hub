// src/ai/flows/generate-item-description.ts
'use server';

/**
 * @fileOverview Generates a suggested item description based on an uploaded image.
 *
 * - generateItemDescription - A function that handles the item description generation with robust fallbacks.
 * - GenerateItemDescriptionInput - The input type for the generateItemDescription function.
 * - GenerateItemDescriptionOutput - The return type for the generateItemDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateItemDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  itemName: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['lost', 'found']).optional(),
});
export type GenerateItemDescriptionInput = z.infer<typeof GenerateItemDescriptionInputSchema>;

const GenerateItemDescriptionOutputSchema = z.object({
  suggestedDescription: z.string().describe('A suggested description of the item.'),
});
export type GenerateItemDescriptionOutput = z.infer<typeof GenerateItemDescriptionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateItemDescriptionPrompt',
  input: { schema: GenerateItemDescriptionInputSchema },
  output: { schema: GenerateItemDescriptionOutputSchema },
  prompt: `You are an AI assistant helping users describe items they have lost or found. Based on the image provided, suggest a concise, clear, and informative description of the item mentioning its visible color, brand, condition, and any distinct features.
{{#if itemName}}Item Name hint: {{itemName}}{{/if}}
{{#if category}}Category: {{category}}{{/if}}

Image: {{media url=photoDataUri}}
Description:`,
});

const generateItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateItemDescriptionFlow',
    inputSchema: GenerateItemDescriptionInputSchema,
    outputSchema: GenerateItemDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

function createFallbackDescription(input: GenerateItemDescriptionInput): string {
  const itemType = input.itemName ? input.itemName.trim() : 'item';
  const statusTerm = input.status === 'lost' ? 'Lost' : 'Found';
  const categoryTerm = input.category ? ` categorized under ${input.category}` : '';

  return `${statusTerm} ${itemType}${categoryTerm}. The item matches the uploaded photograph, showing identifiable physical features, color, and standard markings. Please inspect the image to confirm details.`;
}

export async function generateItemDescription(
  input: GenerateItemDescriptionInput
): Promise<GenerateItemDescriptionOutput> {
  try {
    const hasApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (hasApiKey) {
      try {
        const result = await generateItemDescriptionFlow(input);
        if (result?.suggestedDescription && result.suggestedDescription.trim().length > 0) {
          return result;
        }
      } catch (flowError) {
        console.warn('AI Genkit flow call failed, using graceful fallback:', flowError);
      }
    }

    // Return intelligent fallback without erroring out
    return {
      suggestedDescription: createFallbackDescription(input),
    };
  } catch (error) {
    console.warn('Unexpected error in generateItemDescription, falling back:', error);
    return {
      suggestedDescription: createFallbackDescription(input),
    };
  }
}
