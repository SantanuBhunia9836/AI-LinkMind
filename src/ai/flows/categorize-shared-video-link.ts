'use server';
/**
 * @fileOverview Categorizes a shared video link using AI.
 *
 * - categorizeSharedVideoLink - A function that categorizes a shared video link.
 * - CategorizeSharedVideoLinkInput - The input type for the categorizeSharedVideoLink function.
 * - CategorizeSharedVideoLinkOutput - The return type for the categorizeSharedVideoLink function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

async function extractMetadata(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const html = await response.text();
  const $ = cheerio.load(html);

  let creatorName = 'Unknown';
  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (jsonLdScript) {
    try {
      const jsonData = JSON.parse(jsonLdScript);
      const graph = jsonData['@graph'] || [jsonData];
      for (const item of graph) {
        if (
          (item['@type'] === 'VideoObject' || item['@type'] === 'Clip') &&
          item.author?.name
        ) {
          creatorName = item.author.name;
          break;
        }
        if (item.author?.name) {
          creatorName = item.author.name;
          break;
        }
      }
    } catch (e) {
      console.error('Failed to parse JSON-LD', e);
    }
  }

  const getMetaTag = (name: string) => {
    let content = $(`meta[property="og:${name}"]`).attr('content');
    if (!content) {
      content = $(`meta[name="${name}"]`).attr('content');
    }
    return content || '';
  };

  // 2. Fallback to meta tags and specific selectors if JSON-LD fails
  if (creatorName === 'Unknown') {
    creatorName =
      getMetaTag('author') ||
      getMetaTag('article:author') ||
      $('#upload-info a.yt-simple-endpoint').first().text() ||
      getMetaTag('og:site_name') ||
      'Unknown';
  }

  return {
    title: getMetaTag('title') || $('title').text() || 'No title found',
    description: getMetaTag('description') || 'No description found',
    creatorName: creatorName.trim(),
    thumbnailUrl: getMetaTag('image'),
  };
}

const CategorizeSharedVideoLinkInputSchema = z.object({
  link: z.string().url().describe('The URL of the shared video.'),
});
export type CategorizeSharedVideoLinkInput = z.infer<
  typeof CategorizeSharedVideoLinkInputSchema
>;

const CategorizeSharedVideoLinkOutputSchema = z.object({
  title: z.string().describe('The original title of the video.'),
  description: z.string().describe('The original description of the video.'),
  creatorName: z
    .string()
    .describe("The video creator's channel or account name."),
  category: z.string().describe('The predicted category of the video.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the category prediction (0 to 1).'),
  thumbnailUrl: z
    .string()
    .describe("A URL for the video's thumbnail image."),
});
export type CategorizeSharedVideoLinkOutput = z.infer<
  typeof CategorizeSharedVideoLinkOutputSchema
>;

export async function categorizeSharedVideoLink(
  input: CategorizeSharedVideoLinkInput
): Promise<CategorizeSharedVideoLinkOutput> {
  return categorizeSharedVideoLinkFlow(input);
}

// The prompt now takes plain text and only outputs the category info.
const prompt = ai.definePrompt({
  name: 'categorizeSharedVideoLinkPrompt',
  input: {
    schema: z.object({
      title: z.string(),
      description: z.string(),
    }),
  },
  output: {
    schema: z.object({
      category: z.string().describe('The predicted category of the video.'),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe('The confidence level of the category prediction (0 to 1).'),
    }),
  },
  prompt: `You are an AI expert in categorizing videos. Based on the following title and description, assign the most accurate category.
  Available categories: Music, Sports, Education, Movies, News, Gaming, Entertainment, or suggest a new one if none fit well.
  
  Title: {{title}}
  Description: {{description}}`,
});

const categorizeSharedVideoLinkFlow = ai.defineFlow(
  {
    name: 'categorizeSharedVideoLinkFlow',
    inputSchema: CategorizeSharedVideoLinkInputSchema,
    outputSchema: CategorizeSharedVideoLinkOutputSchema,
  },
  async input => {
    // Step 1: Scrape the metadata directly.
    const metadata = await extractMetadata(input.link);

    // Step 2: Pass the scraped text to the AI for categorization.
    const {output} = await prompt({
      title: metadata.title,
      description: metadata.description,
    });
    
    if (!output) {
      throw new Error("Failed to get a response from the AI model.");
    }

    // Step 3: Combine the scraped data with the AI's output.
    return {
      title: metadata.title,
      description: metadata.description,
      creatorName: metadata.creatorName,
      thumbnailUrl: metadata.thumbnailUrl,
      category: output.category,
      confidence: output.confidence,
    };
  }
);