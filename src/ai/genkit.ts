import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  false;

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'googleai/gemini-2.5-flash',
});

