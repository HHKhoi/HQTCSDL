import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Chọn một tùy chọn...",
  error,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-primary-muted uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left
            flex items-center justify-between transition-all duration-200 cursor-pointer
            ${isOpen ? 'border-primary-gold ring-4 ring-primary-gold/5 shadow-sm' : 'hover:border-slate-300'}
            ${error ? 'border-red-500 ring-red-50' : ''}
          `}
        >
          <span className={selectedOption ? "text-slate-900 font-medium" : "text-slate-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-gold' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden origin-top transition-all duration-200">
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`
                    w-full px-4 py-2 text-sm text-left flex items-center justify-between transition-colors cursor-pointer
                    ${opt.value === value ? 'bg-slate-50 text-primary-gold font-bold' : 'text-slate-600 hover:bg-slate-50'}
                  `}
                >
                  {opt.label}
                  {opt.value === value && <Check size={14} />}
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-4 py-3 text-xs text-slate-400 text-center italic">
                  Không có tùy chọn nào.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{error}</p>}
    </div>
  );
};

export default CustomSelect;
