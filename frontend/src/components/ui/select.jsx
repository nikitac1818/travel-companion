import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, label, setLabel }}>
      <div ref={rootRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = "", children }) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen((o) => !o)}
      className={`flex h-10 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 ${className}`}
    >
      {children}
      <ChevronDown className="w-4 h-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const ctx = useContext(SelectContext);
  return <span className={ctx.label ? "" : "text-gray-400"}>{ctx.label || placeholder || ctx.value || "Select..."}</span>;
}

export function SelectContent({ children }) {
  const ctx = useContext(SelectContext);
  if (!ctx.open) return null;
  return (
    <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto py-1">
      {children}
    </div>
  );
}

export function SelectItem({ value, children }) {
  const ctx = useContext(SelectContext);

  useEffect(() => {
    if (ctx.value === value) ctx.setLabel(children);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.value]);

  return (
    <div
      onClick={() => {
        ctx.onValueChange && ctx.onValueChange(value);
        ctx.setLabel(children);
        ctx.setOpen(false);
      }}
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-sky-50 ${
        ctx.value === value ? "bg-sky-50 font-medium text-sky-700" : "text-gray-700"
      }`}
    >
      {children}
    </div>
  );
}
