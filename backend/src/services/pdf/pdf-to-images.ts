import { fromBuffer } from 'pdf2pic';
import sharp from 'sharp';
import { logger } from '../../utils/logger.js';

export interface PageImage {
  pageNumber: number;
  base64: string;
  mimeType: string;
}

/**
 * Converts PDF pages to PNG images suitable for Vision API
 * @param pdfBase64 Base64 encoded PDF
 * @returns Array of page images
 */
export async function pdfToImages(pdfBase64: string): Promise<PageImage[]> {
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');

  // Configure pdf2pic options
  const options = {
    density: 150, // DPI - balance between quality and token usage
    saveFilename: 'page',
    savePath: '/tmp',
    format: 'png',
    width: 1600, // Max width for good readability
    height: 2200, // Max height
  };

  const converter = fromBuffer(pdfBuffer, options);

  // Get page count by converting first page and checking
  // pdf2pic doesn't have a direct page count method, so we convert all until we get errors
  const pages: PageImage[] = [];
  let pageNumber = 1;
  const maxPages = 50; // Safety limit

  while (pageNumber <= maxPages) {
    try {
      logger.debug(`Converting page ${pageNumber} to image`);
      const result = await converter(pageNumber, { responseType: 'buffer' });

      if (!result.buffer) {
        logger.debug(`No buffer for page ${pageNumber}, assuming end of document`);
        break;
      }

      // Optimize the image with sharp
      const optimizedBuffer = await sharp(result.buffer)
        .png({ quality: 80, compressionLevel: 9 })
        .toBuffer();

      const base64 = optimizedBuffer.toString('base64');

      pages.push({
        pageNumber,
        base64,
        mimeType: 'image/png',
      });

      pageNumber++;
    } catch (error) {
      // pdf2pic throws error when page doesn't exist
      logger.debug(`Finished at page ${pageNumber - 1}`);
      break;
    }
  }

  if (pages.length === 0) {
    throw new Error('Failed to convert any pages from PDF');
  }

  logger.info(`Converted ${pages.length} pages from PDF to images`);
  return pages;
}
