'use client';
import { useState } from 'react';
import { X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

export interface ColDef {
  key: string;
  label: string;
  sortKey?: string;
}

export interface ColState {
  key: string;
  visible: boolean;
}

export function mergeColState(saved: ColState[], defaults: ColState[]): ColState[] {
  const result: ColState[] = [];
  for (const p of saved) {
    if (defaults.find(d => d.key === p.key)) result.push(p);
  }
  for (const d of defaults) {
    if (!result.find(r => r.key === d.key)) result.push(d);
  }
  return result;
}

interface Props {
  allCols: ColDef[];
  colState: ColState[];
  onChange: (updated: ColState[]) => void;
  onClose: () => void;
}

export default function ColumnEditor({ allCols, colState, onChange, onClose }: Props) {
  const [draft, setDraft] = useState<ColState[]>(colState);

  const toggle = (key: string) =>
    setDraft(d => d.map(c => c.key === key ? { ...c, visible: !c.visible } : c));

  const move = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= draft.length) return;
    setDraft(d => {
      const next = [...d];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Edit Columns</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-gray-400 mb-3">Toggle visibility and reorder columns.</p>
          <div className="space-y-0.5">
            {draft.map((col, idx) => {
              const def = allCols.find(d => d.key === col.key);
              if (!def) return null;
              return (
                <div key={col.key} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === draft.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => toggle(col.key)}
                    className="flex-1 flex items-center gap-2 text-sm text-left"
                  >
                    {col.visible
                      ? <Eye size={14} className="text-blue-500 shrink-0" />
                      : <EyeOff size={14} className="text-gray-300 shrink-0" />}
                    <span className={col.visible ? 'text-gray-800' : 'text-gray-400'}>
                      {def.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => { onChange(draft); onClose(); }}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
