import { utils, writeFile } from 'xlsx';
import { ExtractedBidData } from '../types';

export const exportToExcel = (data: ExtractedBidData) => {
  // 1. Prepare Supplier Information
  const supplierRows = [
    ['Supplier Information'],
    ['Name', data.vendor_info.vendor_name],
    ['Address', data.vendor_info.supplier_address || ''],
    ['Phone', data.vendor_info.supplier_phone || ''],
    ['Email', data.vendor_info.supplier_email || ''],
    ['Fax', data.vendor_info.supplier_fax || ''],
    [' '],
  ];

  // 2. Prepare Receiver Information
  const receiverRows = [
    ['Receiver Information'],
    ['Name', data.receiver_info.receiver_name || ''],
    ['Address', data.receiver_info.receiver_address || ''],
    ['Phone', data.receiver_info.receiver_phone || ''],
    ['Email', data.receiver_info.receiver_email || ''],
    ['Fax', data.receiver_info.receiver_fax || ''],
    [' '],
  ];

  // 3. Prepare Quote Details
  const quoteRows = [
    ['Quote Details'],
    ['Quote ID', data.vendor_info.quote_id],
    ['Date', data.vendor_info.quote_date],
    ['Terms', data.vendor_info.terms],
    ['Grand Total', data.summary.grand_total],
    ['Currency', data.summary.currency],
    [' '],
    [' '],
  ];

  // 4. Prepare Line Items Data (excluding page numbers)
  const headers = ['Line', 'Tag', 'Description', 'Qty', 'Unit Price', 'Total'];
  const lineItemRows = data.line_items.map(item => [
    item.line,
    item.tag,
    item.description,
    item.qty,
    item.unit_price,
    item.line_total
  ]);

  // 5. Combine into a single sheet structure
  const worksheetData = [
    ...supplierRows,
    ...receiverRows,
    ...quoteRows,
    headers,
    ...lineItemRows
  ];

  // 6. Create Worksheet
  const worksheet = utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 15 }, // Label / Line
    { wch: 50 }, // Value / Tag / Description
    { wch: 15 }, // Qty
    { wch: 12 }, // Unit Price
    { wch: 15 }, // Total
  ];

  // 7. Create Workbook
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Bid Data');

  // 8. Generate Filename
  const safeVendorName = data.vendor_info.vendor_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${safeVendorName}_bid_data.xlsx`;

  // 9. Write/Download File
  writeFile(workbook, filename);
};
