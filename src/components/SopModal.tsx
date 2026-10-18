import React, { useState } from 'react';
import { X, Copy, Check, Download, Printer, FileText, Shield } from 'lucide-react';

interface SopModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const SopModal: React.FC<SopModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-lg bg-blue-900/50 text-blue-400 border border-blue-700/50">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/40">
                  Official USG SOP / Incident Doc
                </span>
                <span className="text-[10px] text-slate-500 font-mono">SENSITIVE BUT UNCLASSIFIED</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">{title}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded transition"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1.5 rounded transition"
              title="Download as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
          {content}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Compliant with U.S. Department of State 14 FAM 500 &amp; DSSR Regulations</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
