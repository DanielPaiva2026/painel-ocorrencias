'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Selecione...", label, disabled }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="text-sm font-medium text-slate-600 mb-1 block">{label}</label>}
      
      <div 
        className={`w-full rounded-xl border border-border-light bg-white px-3 py-2 text-sm flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-brand-cyan transition-colors'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search className="w-4 h-4 text-slate-400 ml-1" />
            <input 
              type="text" 
              className="bg-transparent border-none outline-none text-sm w-full py-1 text-slate-700 placeholder-slate-400"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          <div className="overflow-y-auto overflow-x-hidden flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-400">Nenhum resultado encontrado</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${value === opt.id ? 'bg-brand-cyan/10 text-brand-dark font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div>{opt.label}</div>
                  {opt.subLabel && <div className="text-xs text-slate-400 mt-0.5">{opt.subLabel}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
