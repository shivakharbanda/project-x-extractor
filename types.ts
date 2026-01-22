export interface VendorInfo {
  vendor_name: string;
  quote_id: string;
  quote_date: string;
  terms: string;
  supplier_address: string;
  supplier_phone: string;
  supplier_email: string;
  supplier_fax: string;
}

export interface ReceiverInfo {
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  receiver_email: string;
  receiver_fax: string;
}

export interface LineItem {
  line: number;
  tag: string;
  tag_page: number;           // 1-indexed page where tag appears
  description: string;
  unit_price: number;
  unit_price_page: number;    // 1-indexed page where unit_price appears
  qty: number;
  line_total: number;
  line_total_page: number;    // 1-indexed page where line_total appears
}

export interface Summary {
  total_items: number;
  grand_total: number;
  currency: string;
}

export interface ExtractedBidData {
  vendor_info: VendorInfo;
  receiver_info: ReceiverInfo;
  line_items: LineItem[];
  summary: Summary;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  relatedLineItems?: number[]; // Array of line numbers
  timestamp: Date;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export interface ProcessingProgress {
  stage: 'converting' | 'extracting' | 'ocr' | 'matching' | 'complete';
  message: string;
  currentPage?: number;
  totalPages?: number;
  percent?: number;
}

export interface TextPosition {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FieldHighlight {
  pageIndex: number;          // 0-indexed page
  boundingBox: BoundingBox;
  fieldType: 'tag' | 'unit_price' | 'line_total';
}

export interface LineHighlight {
  lineId: number;
  highlights: FieldHighlight[];  // Can span multiple pages
}

export interface ContactFieldHighlight {
  fieldName: string;  // e.g. "supplier_phone", "receiver_email"
  pageIndex: number;
  boundingBox: BoundingBox;
}

// OCR Types for Tesseract.js
export interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}

export interface PageOcrData {
  pageIndex: number;
  words: OcrWord[];
  width: number;
  height: number;
}
