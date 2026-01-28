/**
 * Basic test for extraction API
 * Run with: npm test
 */

import { extractedBidDataSchema } from '../src/schemas/validation.js';

// Test sample data
const sampleExtractedData = {
  vendor_info: {
    vendor_name: "Test Vendor",
    quote_id: "12345",
    quote_date: "2024-01-15",
    terms: "Net 30",
    supplier_address: "123 Test St",
    supplier_phone: "555-1234",
    supplier_email: "test@vendor.com",
    supplier_fax: "555-5678",
  },
  receiver_info: {
    receiver_name: "Test Buyer",
    receiver_address: "456 Buyer St",
    receiver_phone: "555-4321",
    receiver_email: "buyer@test.com",
    receiver_fax: "",
  },
  line_items: [
    {
      line: 1,
      tag: "TK-001",
      tag_page: 1,
      description: "Test Tank",
      unit_price: 10000.00,
      unit_price_page: 1,
      qty: 2,
      line_total: 20000.00,
      line_total_page: 1,
    },
  ],
  summary: {
    total_items: 1,
    grand_total: 20000.00,
    currency: "USD",
  },
};

// Test schema validation
function testSchemaValidation() {
  console.log('Testing schema validation...');

  try {
    const result = extractedBidDataSchema.parse(sampleExtractedData);
    console.log('✓ Valid data passes schema validation');
    console.log(`  - Vendor: ${result.vendor_info.vendor_name}`);
    console.log(`  - Line items: ${result.line_items.length}`);
    console.log(`  - Grand total: ${result.summary.grand_total}`);
  } catch (error) {
    console.error('✗ Schema validation failed:', error);
    process.exit(1);
  }

  // Test invalid data
  const invalidData = { ...sampleExtractedData, vendor_info: {} };
  try {
    extractedBidDataSchema.parse(invalidData);
    console.error('✗ Invalid data should have failed validation');
    process.exit(1);
  } catch {
    console.log('✓ Invalid data correctly rejected by schema');
  }

  console.log('\nAll tests passed!');
}

testSchemaValidation();
