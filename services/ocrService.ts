import Tesseract from 'tesseract.js';
import { pdfjs } from 'react-pdf';
import { OcrWord, PageOcrData, LineItem, FieldHighlight, BoundingBox } from '../types';

// Scale used when rendering PDF pages for OCR (higher = better accuracy but slower)
export const OCR_SCALE = 2;

export interface OcrProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

/**
 * Renders a PDF page to a canvas and returns it as a data URL
 */
async function pdfPageToImage(pdfDoc: any, pageNum: number): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: OCR_SCALE });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height
  };
}

/**
 * OCR a single PDF page using Tesseract
 */
async function ocrPage(
  pdfDoc: any,
  pageNum: number,
  worker: Tesseract.Worker
): Promise<PageOcrData> {
  const { dataUrl, width, height } = await pdfPageToImage(pdfDoc, pageNum);

  const result = await worker.recognize(dataUrl);

  const words: OcrWord[] = result.data.words.map(word => ({
    text: word.text,
    bbox: {
      x0: word.bbox.x0,
      y0: word.bbox.y0,
      x1: word.bbox.x1,
      y1: word.bbox.y1
    },
    confidence: word.confidence
  }));

  console.log(`OCR complete for page ${pageNum}: found ${words.length} words`);

  return {
    pageIndex: pageNum - 1, // Convert to 0-based index
    words,
    width,
    height
  };
}

/**
 * Main function: OCR all pages of a PDF file
 */
export async function ocrPdfPages(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<PageOcrData[]> {
  console.log('Starting OCR processing...');

  // Load PDF with pdfjs
  const url = URL.createObjectURL(file);

  try {
    const pdfDoc = await pdfjs.getDocument(url).promise;
    const numPages = pdfDoc.numPages;
    console.log(`PDF loaded for OCR: ${numPages} pages`);

    // Create a single Tesseract worker (reuse across pages to avoid memory spikes)
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // Progress is per-page, handled in loop below
        }
      }
    });

    const results: PageOcrData[] = [];

    // Process pages sequentially to avoid memory issues
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress?.({
        currentPage: pageNum,
        totalPages: numPages,
        status: `Analyzing page ${pageNum} of ${numPages}...`
      });

      const pageResult = await ocrPage(pdfDoc, pageNum, worker);
      results.push(pageResult);
    }

    // Cleanup
    await worker.terminate();

    console.log('OCR processing complete');
    return results;

  } finally {
    URL.revokeObjectURL(url);
  }
}

// Percentage of page height to use as Y-threshold for finding words on same line
const ROW_HEIGHT_PERCENT = 0.04; // 4% of page height - better captures full table rows

/**
 * Extract identifiers from a tag for matching
 * For "TK-8424" → ["TK-8424", "8424"]
 * For "TK-5031, -5032" → ["TK-5031", "5031", "TK-5032", "5032"]
 */
function extractTagIdentifiers(tag: string): string[] {
  const parts = tag.split(/[,\s]+/);
  const identifiers: string[] = [];
  let lastPrefix = '';

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Handle continuation tags like "-5032" by using the last prefix
    let fullTag = trimmed;
    if (trimmed.startsWith('-') && lastPrefix) {
      fullTag = lastPrefix + trimmed;
    }

    // Extract prefix for future continuation handling (e.g., "TK" from "TK-8424")
    const prefixMatch = trimmed.match(/^([A-Z]{2,})-/);
    if (prefixMatch) {
      lastPrefix = prefixMatch[1];
    }

    identifiers.push(fullTag);

    // Also extract just the number portion for flexible matching
    const numMatch = fullTag.match(/\d{4,}/);
    if (numMatch) {
      identifiers.push(numMatch[0]);
    }
  }

  return identifiers.filter(id => id.length > 0);
}

/**
 * Check if an OCR word matches an identifier with strict word boundary matching
 */
function wordMatchesIdentifier(word: string, identifier: string): boolean {
  const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  const cleanId = identifier.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

  if (!cleanWord || !cleanId) return false;

  // Exact match
  if (cleanWord === cleanId) return true;

  // Word ends with the identifier (handles "TK-8424" word matching "8424" identifier)
  if (cleanWord.endsWith(cleanId) && cleanId.length >= 4) return true;

  // Identifier ends with the word (handles "8424" word matching "TK-8424" identifier)
  if (cleanId.endsWith(cleanWord) && cleanWord.length >= 4) return true;

  return false;
}

/**
 * Check if an OCR word matches a price value
 */
function wordMatchesPrice(word: string, price: number): boolean {
  const cleanWord = word.replace(/[$,]/g, '');
  const wordNum = parseFloat(cleanWord);
  if (isNaN(wordNum)) return false;
  const tolerance = Math.max(0.01, price * 0.001);
  return Math.abs(wordNum - price) < tolerance;
}

/**
 * Find all words on the same line as the anchor word using page-height-relative threshold
 */
function findWordsOnSameLine(
  anchorWord: OcrWord,
  allWords: OcrWord[],
  pageHeight: number
): OcrWord[] {
  const yThreshold = pageHeight * ROW_HEIGHT_PERCENT;
  const anchorCenterY = (anchorWord.bbox.y0 + anchorWord.bbox.y1) / 2;

  return allWords.filter(w => {
    const wordCenterY = (w.bbox.y0 + w.bbox.y1) / 2;
    return Math.abs(wordCenterY - anchorCenterY) < yThreshold;
  });
}

/**
 * Find OCR words that match a search tag
 */
export function findTagInOcr(
  tag: string,
  ocrData: PageOcrData[],
  prices?: { unit_price?: number; line_total?: number }
): { pageIndex: number; bbox: { x: number; y: number; width: number; height: number } } | null {
  const identifiers = extractTagIdentifiers(tag);
  console.log(`Searching for tag "${tag}" with identifiers:`, identifiers);

  // Search ALL pages
  for (const page of ocrData) {
    // Try to find a word matching any of our identifiers using strict matching
    let matchingWord: OcrWord | undefined;
    let matchedIdentifier = '';

    for (const identifier of identifiers) {
      matchingWord = page.words.find(w => wordMatchesIdentifier(w.text, identifier));
      if (matchingWord) {
        matchedIdentifier = identifier;
        break;
      }
    }

    if (matchingWord) {
      console.log(`Found OCR match for tag "${tag}" on page ${page.pageIndex + 1}: word="${matchingWord.text}" matched identifier="${matchedIdentifier}" at y=${matchingWord.bbox.y0}`);

      // Find all words on the same line using page-height-relative threshold
      const lineWords = findWordsOnSameLine(matchingWord, page.words, page.height);

      // Also search for price values with expanded threshold
      if (prices) {
        const anchorCenterY = (matchingWord.bbox.y0 + matchingWord.bbox.y1) / 2;
        const expandedThreshold = page.height * 0.05;

        for (const word of page.words) {
          const wordCenterY = (word.bbox.y0 + word.bbox.y1) / 2;
          if (Math.abs(wordCenterY - anchorCenterY) < expandedThreshold) {
            if ((prices.unit_price && wordMatchesPrice(word.text, prices.unit_price)) ||
                (prices.line_total && wordMatchesPrice(word.text, prices.line_total))) {
              if (!lineWords.includes(word)) {
                lineWords.push(word);
              }
            }
          }
        }
      }

      console.log(`Found ${lineWords.length} words on same line (page height: ${page.height}, threshold: ${page.height * ROW_HEIGHT_PERCENT}px)`);

      if (lineWords.length > 0) {
        // Calculate bounding box for entire line
        const minX = Math.min(...lineWords.map(w => w.bbox.x0));
        const maxX = Math.max(...lineWords.map(w => w.bbox.x1));
        const minY = Math.min(...lineWords.map(w => w.bbox.y0));
        const maxY = Math.max(...lineWords.map(w => w.bbox.y1));

        console.log(`Line bbox: x=${minX}-${maxX}, y=${minY}-${maxY}`);

        return {
          pageIndex: page.pageIndex,
          bbox: {
            x: minX - 8, // Add padding
            y: minY - 4,
            width: (maxX - minX) + 16,
            height: (maxY - minY) + 8
          }
        };
      }
    }
  }

  console.log(`No OCR match found for tag "${tag}"`);
  return null;
}

/**
 * Find a tag on a specific page and return its bounding box
 */
function findTagOnPage(tag: string, pageData: PageOcrData): BoundingBox | null {
  const identifiers = extractTagIdentifiers(tag);

  for (const identifier of identifiers) {
    const matchingWord = pageData.words.find(w => wordMatchesIdentifier(w.text, identifier));
    if (matchingWord) {
      return {
        x: matchingWord.bbox.x0 - 4,
        y: matchingWord.bbox.y0 - 2,
        width: (matchingWord.bbox.x1 - matchingWord.bbox.x0) + 8,
        height: (matchingWord.bbox.y1 - matchingWord.bbox.y0) + 4
      };
    }
  }

  return null;
}

/**
 * Find a price value on a specific page and return its bounding box
 */
function findPriceOnPage(price: number, pageData: PageOcrData): BoundingBox | null {
  for (const word of pageData.words) {
    if (wordMatchesPrice(word.text, price)) {
      return {
        x: word.bbox.x0 - 4,
        y: word.bbox.y0 - 2,
        width: (word.bbox.x1 - word.bbox.x0) + 8,
        height: (word.bbox.y1 - word.bbox.y0) + 4
      };
    }
  }

  return null;
}

/**
 * Find all fields (tag, unit_price, line_total) for a line item on their specific pages
 * Returns an array of FieldHighlight objects that may span multiple pages
 */
export function findLineItemFields(
  item: LineItem,
  ocrData: PageOcrData[]
): FieldHighlight[] {
  const highlights: FieldHighlight[] = [];

  // 1. Find tag on its specific page
  const tagPageData = ocrData.find(p => p.pageIndex === item.tag_page - 1);
  if (tagPageData) {
    const tagBbox = findTagOnPage(item.tag, tagPageData);
    if (tagBbox) {
      highlights.push({
        pageIndex: item.tag_page - 1,
        boundingBox: tagBbox,
        fieldType: 'tag'
      });
    }
  }

  // 2. Find unit_price on its specific page
  const unitPricePageData = ocrData.find(p => p.pageIndex === item.unit_price_page - 1);
  if (unitPricePageData) {
    const priceBbox = findPriceOnPage(item.unit_price, unitPricePageData);
    if (priceBbox) {
      highlights.push({
        pageIndex: item.unit_price_page - 1,
        boundingBox: priceBbox,
        fieldType: 'unit_price'
      });
    }
  }

  // 3. Find line_total on its specific page
  const totalPageData = ocrData.find(p => p.pageIndex === item.line_total_page - 1);
  if (totalPageData) {
    const totalBbox = findPriceOnPage(item.line_total, totalPageData);
    if (totalBbox) {
      highlights.push({
        pageIndex: item.line_total_page - 1,
        boundingBox: totalBbox,
        fieldType: 'line_total'
      });
    }
  }

  return highlights;
}
