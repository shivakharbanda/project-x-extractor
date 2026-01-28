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
  tag_page: number;
  description: string;
  unit_price: number;
  unit_price_page: number;
  qty: number;
  line_total: number;
  line_total_page: number;
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
  role: 'user' | 'model';
  text: string;
}

export interface ChatResponse {
  text: string;
  relatedLineItems?: number[];
}

export interface ExtractRequest {
  file: {
    base64: string;
    mimeType: string;
  };
}

export interface ExtractResponse {
  success: boolean;
  data?: ExtractedBidData;
  provider?: string;
  processingTimeMs?: number;
  error?: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  bidData: ExtractedBidData;
}

export interface ChatApiResponse {
  success: boolean;
  response?: ChatResponse;
  error?: string;
}
