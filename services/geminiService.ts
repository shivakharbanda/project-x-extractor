import { GoogleGenAI, Schema, Type } from "@google/genai";
import { ExtractedBidData, ChatMessage } from "../types";

const EXTRACTION_PROMPT = `Task
Extract all pricing line items from vendor bid/quote PDFs and output them in structured JSON format.
Instructions
You are a data extraction specialist. Your task is to analyze vendor bid documents and extract pricing information into a standardized JSON structure.
Input

PDF document containing vendor quotes/bids with multiple line items
Each line item typically includes: tag numbers, descriptions, unit prices, quantities, and line totals

Required Output Format
Return a JSON object with the following structure:
json{
  "vendor_info": {
    "vendor_name": "string",
    "quote_id": "string",
    "quote_date": "YYYY-MM-DD",
    "terms": "string",
    "supplier_address": "string",
    "supplier_phone": "string",
    "supplier_email": "string",
    "supplier_fax": "string"
  },
  "receiver_info": {
    "receiver_name": "string",
    "receiver_address": "string",
    "receiver_phone": "string",
    "receiver_email": "string",
    "receiver_fax": "string"
  },
  "line_items": [
    {
      "line": 1,
      "tag": "string",
      "tag_page": 1,
      "description": "string",
      "unit_price": 0.00,
      "unit_price_page": 1,
      "qty": 1,
      "line_total": 0.00,
      "line_total_page": 1
    }
  ],
  "summary": {
    "total_items": 0,
    "grand_total": 0.00,
    "currency": "USD"
  }
}
Field Definitions:

line - Sequential line number (integer)
tag - Equipment tag number(s) (string)
tag_page - 1-indexed page number where the tag appears in the document (integer)
description - Brief item description (string)
unit_price - Price per unit (float)
unit_price_page - 1-indexed page number where the unit price appears (integer)
qty - Quantity ordered (integer)
line_total - Total price for line item (float)
line_total_page - 1-indexed page number where the line total appears (integer)

Page Number Extraction:
- For each field (tag, unit_price, line_total), include the 1-indexed page number where that value appears
- If a line item spans multiple pages, each field may have a different page number
- Example: tag might be on page 1, while prices are on page 2
- Always use 1-indexed page numbers (first page = 1, not 0)

Extraction Rules

Vendor Info:

Extract vendor name from header (e.g., "Industrial Tank Supplier")
Extract quote ID (e.g., "4444")
Extract quote date in YYYY-MM-DD format
Extract payment terms (e.g., "Net 90 Days")
Extract supplier_address - Full address including street, city, state, zip (e.g., "100 Summer Street, Dallas Texas 77778")
Extract supplier_phone - Phone number with any format (e.g., "123-123-1234")
Extract supplier_email - Email address if present
Extract supplier_fax - Fax number if present (e.g., "123-123-4321")

Receiver Info:

Extract receiver_name - Name of the receiving company/person (e.g., "ABC Corporation", "John Smith")
Extract receiver_address - Full address of the receiving company/person (e.g., "123 ABC Street, Houston Texas 77777")
Extract receiver_phone - Phone number of the receiver
Extract receiver_email - Email address of the receiver
Extract receiver_fax - Fax number of the receiver if present
Look for sections labeled "Ship To", "Bill To", "Attention", "Customer", or similar to find receiver info


Line Numbers: Assign sequential numbers (1, 2, 3...) if not explicitly stated in document
Tag Numbers:

Extract equipment/part tag numbers (e.g., "TK-8424", "TK-5031, -5032")
Keep multiple tags together if they're for the same line item
Preserve exact format including prefixes and suffixes


Description:

Extract the primary equipment/item name
Keep descriptions concise (e.g., "1100L Break Tank", "2000L Break Tank")
Exclude detailed specifications unless specifically part of the item name


Unit Price:

Extract price per individual unit as a float (no currency symbols)
If only line total is given, calculate unit price by dividing by quantity


Quantity:

Extract number of units being quoted as integer
Default to 1 if not explicitly stated


Line Total:

Extract or calculate total price (Unit Price × Qty) as float
No currency symbols in the number


Summary:

Count total number of line items
Calculate grand total by summing all line totals
Specify currency (default: "USD")



JSON Formatting Requirements
Data Types:

vendor_name: string
quote_id: string
quote_date: string (ISO 8601 format: YYYY-MM-DD)
terms: string
line: integer
tag: string
description: string
unit_price: float (2 decimal places)
qty: integer
line_total: float (2 decimal places)
total_items: integer
grand_total: float (2 decimal places)
currency: string (ISO 4217 code)

Formatting Rules:

All monetary values as floats without currency symbols
Dates in ISO 8601 format (YYYY-MM-DD)
No null values - use empty string "" for missing text, 0 for missing numbers
Numbers rounded to 2 decimal places
Ensure valid JSON syntax (proper escaping, no trailing commas)

Common Document Patterns to Look For

Tag patterns: "Tag Nos.", "Part:", "Line:", followed by alphanumeric codes
Price patterns: Dollar amounts like $77,000.00 or $115,000.00
Quantity indicators: Numbers often appearing before or with unit prices
Expiration dates: Usually indicate separate line items
Working volumes: Often part of descriptions (e.g., "1100L", "2000L")

Edge Cases to Handle

Multiple tags per line: Keep together with commas (e.g., "TK-5031, -5032")
Missing quantities: Default to 1
Calculated totals: If unit price × qty ≠ line total, use the stated line total
Currency symbols: Preserve in formatting but store as numbers
Incomplete line items: Skip items without both description and pricing

Validation Checks
Before outputting, verify:

 Valid JSON syntax (use JSON validator)
 All required fields present in vendor_info and summary
 All line_items have all 6 required fields
 Line totals = unit_price × qty (or use stated total if different)
 No duplicate line numbers
 grand_total equals sum of all line_totals
 All numeric values have exactly 2 decimal places
 Date in YYYY-MM-DD format

Example Output
json{
  "vendor_info": {
    "vendor_name": "Industrial Tank Supplier",
    "quote_id": "4444",
    "quote_date": "2020-10-15",
    "terms": "Net 90 Days",
    "supplier_address": "100 Summer Street, Dallas Texas 77778",
    "supplier_phone": "123-123-1234",
    "supplier_email": "",
    "supplier_fax": "123-123-4321"
  },
  "receiver_info": {
    "receiver_name": "Company",
    "receiver_address": "123 ABC Street, Houston Texas 77777",
    "receiver_phone": "123 132 1231",
    "receiver_email": "",
    "receiver_fax": ""
  },
  "line_items": [
    {
      "line": 1,
      "tag": "TK-8424",
      "tag_page": 1,
      "description": "1100L Break Tank",
      "unit_price": 77000.00,
      "unit_price_page": 1,
      "qty": 1,
      "line_total": 77000.00,
      "line_total_page": 1
    },
    {
      "line": 2,
      "tag": "TK-8234",
      "tag_page": 1,
      "description": "2000L Break Tank",
      "unit_price": 115000.00,
      "unit_price_page": 1,
      "qty": 1,
      "line_total": 115000.00,
      "line_total_page": 1
    },
    {
      "line": 3,
      "tag": "TK-7601",
      "tag_page": 2,
      "description": "1100L Storage Tank",
      "unit_price": 110000.00,
      "unit_price_page": 2,
      "qty": 1,
      "line_total": 110000.00,
      "line_total_page": 2
    },
    {
      "line": 4,
      "tag": "TK-5031, -5032",
      "tag_page": 2,
      "description": "1000L Waste Surge Tank",
      "unit_price": 215000.00,
      "unit_price_page": 2,
      "qty": 2,
      "line_total": 430000.00,
      "line_total_page": 2
    },
    {
      "line": 5,
      "tag": "TK-4343, -4353",
      "tag_page": 3,
      "description": "3000L Floor Drain Tank",
      "unit_price": 119000.00,
      "unit_price_page": 3,
      "qty": 2,
      "line_total": 238000.00,
      "line_total_page": 3
    }
  ],
  "summary": {
    "total_items": 5,
    "grand_total": 970000.00,
    "currency": "USD"
  }
}
Error Handling
If you encounter:

Unclear pricing: Flag the line item and note the ambiguity
Missing critical data: Include the line but mark missing fields as "N/A"
Conflicting information: Use the most recent or explicitly stated value
Multiple pricing sections: Extract all sections and clearly label/separate them

Output Instructions

Return ONLY the JSON object - no additional text or markdown formatting
Ensure the JSON is properly formatted and valid
Use 2-space or 4-space indentation for readability
Include all required fields even if some values are empty strings or 0

Response Format
After extraction, return:

The complete JSON object
Nothing else (no explanations, summaries, or markdown code blocks unless specifically requested)`;

const extractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vendor_info: {
      type: Type.OBJECT,
      properties: {
        vendor_name: { type: Type.STRING },
        quote_id: { type: Type.STRING },
        quote_date: { type: Type.STRING },
        terms: { type: Type.STRING },
        supplier_address: { type: Type.STRING },
        supplier_phone: { type: Type.STRING },
        supplier_email: { type: Type.STRING },
        supplier_fax: { type: Type.STRING },
      },
      required: ['vendor_name', 'quote_id', 'quote_date', 'terms', 'supplier_address', 'supplier_phone', 'supplier_email', 'supplier_fax'],
    },
    receiver_info: {
      type: Type.OBJECT,
      properties: {
        receiver_name: { type: Type.STRING },
        receiver_address: { type: Type.STRING },
        receiver_phone: { type: Type.STRING },
        receiver_email: { type: Type.STRING },
        receiver_fax: { type: Type.STRING },
      },
      required: ['receiver_name', 'receiver_address', 'receiver_phone', 'receiver_email', 'receiver_fax'],
    },
    line_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER },
          tag: { type: Type.STRING },
          tag_page: { type: Type.INTEGER },           // 1-indexed page where tag appears
          description: { type: Type.STRING },
          unit_price: { type: Type.NUMBER },
          unit_price_page: { type: Type.INTEGER },    // 1-indexed page where unit_price appears
          qty: { type: Type.INTEGER },
          line_total: { type: Type.NUMBER },
          line_total_page: { type: Type.INTEGER },    // 1-indexed page where line_total appears
        },
        required: ['line', 'tag', 'tag_page', 'description', 'unit_price', 'unit_price_page', 'qty', 'line_total', 'line_total_page'],
      },
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        total_items: { type: Type.INTEGER },
        grand_total: { type: Type.NUMBER },
        currency: { type: Type.STRING },
      },
      required: ['total_items', 'grand_total', 'currency'],
    },
  },
  required: ['vendor_info', 'receiver_info', 'line_items', 'summary'],
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async extractBidData(fileBase64: string, mimeType: string): Promise<ExtractedBidData> {
    const result = await this.ai.models.generateContent({
      // model: 'gemini-2.5-flash',
      model: 'gemini-3-flash-preview',

      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: mimeType,
              },
            },
            {
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: extractionSchema,
      },
    });

    const text = result.text;
    if (!text) {
      throw new Error("No data extracted from the document.");
    }
    return JSON.parse(text) as ExtractedBidData;
  }

  async chatWithBid(
    history: ChatMessage[],
    newMessage: string,
    bidData: ExtractedBidData
  ): Promise<{ text: string; relatedLineItems?: number[] }> {

    // We construct a specific system instruction that gives the model access to the extracted data
    // and instructions on how to respond.
    const systemInstruction = `
      You are a helpful assistant analyzing a vendor bid.
      You have access to the following extracted structured data from the bid:
      ${JSON.stringify(bidData)}

      Instructions:
      1. Answer the user's questions based on the bid data provided above.
      2. If the user asks about specific items, prices, or comparisons, refer to the 'line_items' array.
      3. If your answer refers to specific line items, you MUST output a JSON object with two fields:
         - "response": Your natural language answer (markdown supported).
         - "line_numbers": An array of integers representing the 'line' numbers of the items relevant to your answer.
      4. If no specific lines are relevant, return an empty array for "line_numbers".
      5. Be concise and professional.
    `;

    // Format history for Gemini
    // Note: In a real app we might want to send the PDF again if we wanted visual grounding,
    // but here we are using the structured data context which is faster and cleaner for data queries.
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...chatHistory, { role: 'user', parts: [{ text: newMessage }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                response: { type: Type.STRING },
                line_numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
            }
        }
      },
    });

    const responseText = result.text;
    const parsed = JSON.parse(responseText);

    return {
        text: parsed.response,
        relatedLineItems: parsed.line_numbers
    };
  }
}

export const geminiService = new GeminiService();

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
