import { utils, writeFile } from 'xlsx';
import { ExtractedBidData } from '../types';

export const exportToExcel = (data: ExtractedBidData) => {
  // 1. Prepare Vendor Info Data
  const vendorRows = [
    ['Vendor Information'],
    ['Name', data.vendor_info.vendor_name],
    ['Quote ID', data.vendor_info.quote_id],
    ['Date', data.vendor_info.quote_date],
    ['Terms', data.vendor_info.terms],
    [' '], // Empty row for spacing
    ['Grand Total', data.summary.grand_total],
    ['Currency', data.summary.currency],
    [' '],
    [' '],
  ];

  // 2. Prepare Line Items Data (excluding page numbers)
  const headers = ['Line', 'Tag', 'Description', 'Qty', 'Unit Price', 'Total'];
  const lineItemRows = data.line_items.map(item => [
    item.line,
    item.tag,
    item.description,
    item.qty,
    item.unit_price,
    item.line_total
  ]);

  // 3. Combine into a single sheet structure
  const worksheetData = [
    ...vendorRows,
    headers,
    ...lineItemRows
  ];

  // 4. Create Worksheet
  const worksheet = utils.aoa_to_sheet(worksheetData);

  // Optional: Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 8 },  // Line
    { wch: 15 }, // Tag
    { wch: 50 }, // Description
    { wch: 10 }, // Qty
    { wch: 12 }, // Unit Price
    { wch: 15 }, // Total
  ];

  // 5. Create Workbook
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Bid Data');

  // 6. Generate Filename
  const safeVendorName = data.vendor_info.vendor_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${safeVendorName}_bid_data.xlsx`;

  // 7. Write/Download File
  writeFile(workbook, filename);
};
