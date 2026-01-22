import React, { useState } from 'react';
import { ExtractedBidData, LineItem } from '../types';
import { Calendar, FileText, Hash, Download, Eye, EyeOff, Package, Users } from 'lucide-react';
import { exportToExcel } from '../services/exportService';

interface DataPanelProps {
  data: ExtractedBidData;
  highlightedLineId: number | null;
  onLineHover: (id: number | null) => void;
  onLineClick: (id: number) => void;
  onContactFieldClick?: (fieldName: string) => void;
  showHighlights: boolean;
  onToggleHighlights: () => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  data,
  highlightedLineId,
  onLineHover,
  onLineClick,
  onContactFieldClick,
  showHighlights,
  onToggleHighlights
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'contact'>('items');

  // Helper for clickable contact cells
  const ContactCell: React.FC<{ fieldName: string; value: string }> = ({ fieldName, value }) => (
    <td
      className={`py-2 px-3 text-slate-800 ${onContactFieldClick && value && value !== '-' ? 'cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors' : ''}`}
      onClick={() => onContactFieldClick && value && value !== '-' && onContactFieldClick(fieldName)}
      title={onContactFieldClick && value && value !== '-' ? 'Click to locate in document' : undefined}
    >
      {value || '-'}
    </td>
  );

  // Helper for clickable header fields (quote ID, date, terms)
  const ClickableField: React.FC<{ fieldName: string; value: string; children: React.ReactNode }> = ({ fieldName, value, children }) => (
    <div
      className={`flex items-center gap-1.5 ${onContactFieldClick && value ? 'cursor-pointer hover:text-indigo-600 transition-colors' : ''}`}
      onClick={() => onContactFieldClick && value && onContactFieldClick(fieldName)}
      title={onContactFieldClick && value ? 'Click to locate in document' : undefined}
    >
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Compact Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">{data.vendor_info.vendor_name}</h2>
            <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-slate-600">
              <ClickableField fieldName="quote_id" value={data.vendor_info.quote_id}>
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>#{data.vendor_info.quote_id}</span>
              </ClickableField>
              <ClickableField fieldName="quote_date" value={data.vendor_info.quote_date}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{data.vendor_info.quote_date}</span>
              </ClickableField>
              <ClickableField fieldName="terms" value={data.vendor_info.terms}>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{data.vendor_info.terms}</span>
              </ClickableField>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="text-right bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
              <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">Grand Total</p>
              <p className="text-lg font-bold text-indigo-900">
                {data.summary.grand_total.toLocaleString('en-US', { style: 'currency', currency: data.summary.currency })}
              </p>
            </div>
            <button
              onClick={() => exportToExcel(data)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors shadow-sm"
              title="Download as Excel"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={onToggleHighlights}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm ${
                showHighlights
                  ? 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                  : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
              title={showHighlights ? 'Hide highlights' : 'Show highlights'}
            >
              {showHighlights ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 bg-white px-4">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'items'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Package className="w-4 h-4" />
          Items
          <span className={`px-1.5 py-0.5 text-xs rounded-full ${
            activeTab === 'items' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {data.summary.total_items}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'contact'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Contact Info
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'items' ? (
          /* Items Tab Content */
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">Line</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Tag</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Description</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Qty</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Unit Price</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.line_items.map((item) => (
                <tr
                  key={item.line}
                  className={`
                      group transition-colors duration-150 cursor-pointer text-sm
                      ${highlightedLineId === item.line ? 'bg-indigo-50 ring-l-4 ring-indigo-500' : 'hover:bg-slate-50'}
                  `}
                  onClick={() => onLineClick(item.line)}
                  onMouseEnter={() => onLineHover(item.line)}
                  onMouseLeave={() => onLineHover(null)}
                  id={`table-row-${item.line}`}
                >
                  <td className="py-3 px-4 font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">
                    {item.line}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 bg-slate-50/50 rounded m-1">
                    {item.tag}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium max-w-xs truncate" title={item.description}>
                    {item.description}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {item.qty}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 font-mono">
                    {item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                    {item.line_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Contact Info Tab Content */
          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Supplier Information Table */}
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden h-fit">
              <thead>
                <tr className="bg-slate-100">
                  <th colSpan={2} className="py-2 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Supplier Information
                  </th>
                </tr>
                <tr className="bg-slate-50">
                  <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 border-t border-slate-200 w-24">Field</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 border-t border-slate-200">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Name</td>
                  <ContactCell fieldName="vendor_name" value={data.vendor_info.vendor_name} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Address</td>
                  <ContactCell fieldName="supplier_address" value={data.vendor_info.supplier_address} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Phone</td>
                  <ContactCell fieldName="supplier_phone" value={data.vendor_info.supplier_phone} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Email</td>
                  <ContactCell fieldName="supplier_email" value={data.vendor_info.supplier_email} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Fax</td>
                  <ContactCell fieldName="supplier_fax" value={data.vendor_info.supplier_fax} />
                </tr>
              </tbody>
            </table>

            {/* Receiver Information Table */}
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden h-fit">
              <thead>
                <tr className="bg-slate-100">
                  <th colSpan={2} className="py-2 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Receiver Information
                  </th>
                </tr>
                <tr className="bg-slate-50">
                  <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 border-t border-slate-200 w-24">Field</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 border-t border-slate-200">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Name</td>
                  <ContactCell fieldName="receiver_name" value={data.receiver_info.receiver_name} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Address</td>
                  <ContactCell fieldName="receiver_address" value={data.receiver_info.receiver_address} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Phone</td>
                  <ContactCell fieldName="receiver_phone" value={data.receiver_info.receiver_phone} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Email</td>
                  <ContactCell fieldName="receiver_email" value={data.receiver_info.receiver_email} />
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-2 px-3 text-slate-600 font-medium">Fax</td>
                  <ContactCell fieldName="receiver_fax" value={data.receiver_info.receiver_fax} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
        <span>{data.summary.total_items} items retrieved</span>
      </div>
    </div>
  );
};
