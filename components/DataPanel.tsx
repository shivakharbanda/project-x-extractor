import React from 'react';
import { ExtractedBidData, LineItem } from '../types';
import { DollarSign, Calendar, FileText, Hash, Download } from 'lucide-react';
import { exportToExcel } from '../services/exportService';

interface DataPanelProps {
  data: ExtractedBidData;
  highlightedLineId: number | null;
  onLineHover: (id: number | null) => void;
  onLineClick: (id: number) => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  data,
  highlightedLineId,
  onLineHover,
  onLineClick
}) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header / Vendor Info */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{data.vendor_info.vendor_name}</h2>
            <div className="flex gap-4 mt-2 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-400" />
                <span>Quote #{data.vendor_info.quote_id}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{data.vendor_info.quote_date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>{data.vendor_info.terms}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Grand Total</p>
              <p className="text-2xl font-bold text-indigo-900">
                {data.summary.grand_total.toLocaleString('en-US', { style: 'currency', currency: data.summary.currency })}
              </p>
            </div>
            <button
              onClick={() => exportToExcel(data)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors shadow-sm"
              title="Download as Excel"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
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
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
        <span>{data.summary.total_items} items retrieved</span>
      </div>
    </div >
  );
};
