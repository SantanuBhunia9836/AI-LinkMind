'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

async function extractMetadataFallback(url: string) {
  // Fallback: Extract metadata using basic fetch without scraping
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || 'No title found',
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || 'No description found',
      creatorName: $('meta[property="og:site_name"]').attr('content') || 'Unknown',
      thumbnailUrl: $('meta[property="og:image"]').attr('content') || '',
    };
  } catch (error) {
    console.error('Fallback metadata extraction failed:', error);
    return {
      title: 'Link from ' + new URL(url).hostname,
      description: 'No description available',
      creatorName: 'Unknown',
      thumbnailUrl: '',
    };
  }
}

async function extractMetadata(url: string) {
  const SCRAPING_API_KEY = process.env.BROWSERLESS_API_KEY;
  
  if (!SCRAPING_API_KEY) {
    console.warn('BROWSERLESS_API_KEY not configured, using fallback metadata extraction');
    return extractMetadataFallback(url);
  }

  const scrapingUrl = `https://chrome.browserless.io/scrape?token=${SCRAPING_API_KEY}`;

  try {
    const response = await fetch(scrapingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        elements: [{ selector: 'body' }],
      }),
    });

    if (!response.ok) {
      console.warn(`Browserless API returned ${response.status}, using fallback metadata extraction`);
      return extractMetadataFallback(url);
    }

    const jsonResponse = await response.json();
    const html = jsonResponse.data[0].results[0].html;
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
  } catch (error) {
    console.error('Browserless scraping failed:', error);
    return extractMetadataFallback(url);
  }
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
    const metadata = await extractMetadata(input.link);
    const {output} = await prompt({
      title: metadata.title,
      description: metadata.description,
    });
    
    if (!output) {
      throw new Error("Failed to get a response from the AI model.");
    }

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

