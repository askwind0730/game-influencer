import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  maxVisited: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export default function Pagination({ currentPage, hasNext, hasPrev, maxVisited, onPageChange, loading }: Props) {
  const [jumpInput, setJumpInput] = useState("");

  const handleJump = () => {
    const p = parseInt(jumpInput);
    if (p >= 1 && p <= maxVisited) {
      onPageChange(p);
      setJumpInput("");
    }
  };

  const pages: (number | null)[] = [];
  pages.push(1);
  if (maxVisited > 1) {
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(currentPage + 1, maxVisited);
    if (start > 2) pages.push(null);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < maxVisited - 1) pages.push(null);
    if (end < maxVisited) pages.push(maxVisited);
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-10 mb-4">
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={!hasPrev || loading}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          {String.fromCharCode(0x4E0A, 0x4E00, 0x9875)}
        </button>
        {pages.map((p, i) =>
          p === null ? (
            <span key={"e" + i} className="px-2 text-slate-300 select-none">...</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)} disabled={loading}
              className={"min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all " + (p === currentPage ? "bg-primary-600 text-white shadow-sm shadow-primary-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300")}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={!hasNext || loading}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1">
          {String.fromCharCode(0x4E0B, 0x4E00, 0x9875)}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-400">
        {String.fromCharCode(0x8DF3, 0x8F6C, 0x5230, 0x7B2C)}
        <input type="number" min={1} max={maxVisited} value={jumpInput}
          onChange={e => setJumpInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleJump()}
          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {String.fromCharCode(0x9875)}
        <button onClick={handleJump} disabled={!jumpInput || loading || parseInt(jumpInput) > maxVisited || parseInt(jumpInput) < 1}
          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {String.fromCharCode(0x8DF3, 0x8F6C)}
        </button>
        <span className="text-xs text-slate-400">(1-{maxVisited}{String.fromCharCode(0x9875)})</span>
      </div>
    </div>
  );
}
