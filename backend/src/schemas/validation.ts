import { z } from 'zod';

// Vendor Info Schema
export const vendorInfoSchema = z.object({
  vendor_name: z.string(),
  quote_id: z.string(),
  quote_date: z.string(),
  terms: z.string(),
  supplier_address: z.string(),
  supplier_phone: z.string(),
  supplier_email: z.string(),
  supplier_fax: z.string(),
});

// Receiver Info Schema
export const receiverInfoSchema = z.object({
  receiver_name: z.string(),
  receiver_address: z.string(),
  receiver_phone: z.string(),
  receiver_email: z.string(),
  receiver_fax: z.string(),
});

// Line Item Schema
export const lineItemSchema = z.object({
  line: z.number().int(),
  tag: z.string(),
  tag_page: z.number().int(),
  description: z.string(),
  unit_price: z.number(),
  unit_price_page: z.number().int(),
  qty: z.number().int(),
  line_total: z.number(),
  line_total_page: z.number().int(),
});

// Summary Schema
export const summarySchema = z.object({
  total_items: z.number().int(),
  grand_total: z.number(),
  currency: z.string(),
});

// Full Extracted Bid Data Schema
export const extractedBidDataSchema = z.object({
  vendor_info: vendorInfoSchema,
  receiver_info: receiverInfoSchema,
  line_items: z.array(lineItemSchema),
  summary: summarySchema,
});

// Request Validation Schemas
export const extractRequestSchema = z.object({
  file: z.object({
    base64: z.string().min(1, 'Base64 data is required'),
    mimeType: z.string().min(1, 'MIME type is required'),
  }),
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z.array(chatMessageSchema),
  bidData: extractedBidDataSchema,
});

// Type exports
export type VendorInfoInput = z.infer<typeof vendorInfoSchema>;
export type ReceiverInfoInput = z.infer<typeof receiverInfoSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
export type SummaryInput = z.infer<typeof summarySchema>;
export type ExtractedBidDataInput = z.infer<typeof extractedBidDataSchema>;
export type ExtractRequestInput = z.infer<typeof extractRequestSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
