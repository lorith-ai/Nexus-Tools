import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command, CornerDownLeft, ArrowRight, ExternalLink, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, tools, categories }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter tools based on query
  const filteredTools = useMemo(() => {
    if (!query) return tools.slice(0, 5); // Show first 5 by default or favorites?
    const lowerQuery = query.toLowerCase();
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(lowerQuery) || 
      tool.useCase.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
    );
  }, [query, tools]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredTools.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          window.open(filteredTools[selectedIndex].link, '_blank');
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      listRef.current.children[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Search className="text-white/40" size={20} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-lg text-white placeholder:text-white/20 outline-none"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden md:flex items-center gap-1">
             <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/40 font-mono">ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2" ref={listRef}>
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-white/30">
              <Command size={48} className="mx-auto mb-4 opacity-20" />
              <p>No results found.</p>
            </div>
          ) : (
            filteredTools.map((tool, index) => {
              const isActive = index === selectedIndex;
              const catLabel = categories.find(c => c.id === tool.category)?.label || tool.category;
              
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    window.open(tool.link, '_blank');
                    onClose();
                  }}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-teal-500/10 text-white' 
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-teal-500 text-black' : 'bg-white/5 text-white/50'}`}>
                      {/* Simple fallback icon logic if you don't pass components, or use the Command icon if simpler */}
                      <Command size={18} /> 
                    </div>
                    <div className="flex flex-col truncate">
                      <span className={`font-medium truncate ${isActive ? 'text-teal-400' : 'text-white'}`}>{tool.name}</span>
                      <span className="text-xs opacity-60 truncate">{tool.useCase}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-2 py-1 rounded bg-white/5 border border-white/5">
                      {catLabel}
                    </span>
                    {isActive && <CornerDownLeft size={16} className="text-teal-500 animate-pulse" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 bg-white/2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30">
          <div className="flex gap-2">
            <span><strong className="text-white/50">↑↓</strong> to navigate</span>
            <span><strong className="text-white/50">↵</strong> to open</span>
          </div>
          <div>
            Nexus Command
          </div>
        </div>
      </div>
    </div>
  );
}
