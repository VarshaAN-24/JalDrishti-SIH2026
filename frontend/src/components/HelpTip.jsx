import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

/**
 * HelpTip — A friendly, accessible "?" help badge for field users.
 * Explains unfamiliar or technical features in plain English.
 */
export default function HelpTip({ title, text, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-sky-900/60 text-slate-400 hover:text-sky-300 inline-flex items-center justify-center text-[10px] font-bold border border-slate-700 hover:border-sky-500/50 transition-all cursor-pointer ml-1 focus:outline-none"
        title={text || title}
        aria-label={title || "Help"}
      >
        ?
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-slate-900 border border-sky-500/40 rounded-xl shadow-2xl text-xs text-slate-200 font-sans leading-relaxed animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              {title || "Help"}
            </span>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-normal">{text}</p>
        </div>
      )}
    </span>
  );
}
