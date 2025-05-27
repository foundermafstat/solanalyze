import React from 'react';

interface MarketStatsTableProps {
  min: number | null;
  max: number | null;
  avg: number | null;
  min5: number | null;
  max5: number | null;
  min15: number | null;
  max15: number | null;
  volume: number | null;
}

import { useState } from 'react';

export default function MarketStatsTable({
  min, max, avg, min5, max5, min15, max15, volume
}: MarketStatsTableProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full mt-0">
      <button
        type="button"
        className="absolute top-2 right-2 z-20 text-xs text-blue-400 bg-gray-900/80 rounded px-2 py-1 hover:bg-blue-900/80 focus:outline-none flex items-center gap-1 shadow"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{transition: 'background 0.2s'}}
      >
        {open ? 'Hide' : 'More'}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div
        className={`absolute right-2 top-9 z-30 bg-gray-950/95 rounded-xl shadow-xl border border-gray-800 p-4 min-w-[180px] max-w-[90vw] transition-all duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} backdrop-blur`}
        style={{boxShadow: '0 8px 32px rgba(0,0,0,0.25)', transition: 'opacity 0.2s, transform 0.2s', transform: open ? 'translateY(0)' : 'translateY(-10px)'}}
        aria-hidden={!open}
      >
        <table className="w-full text-xs text-gray-200">
          <tbody>
            <tr>
              <td className="py-1">Объём (1 мин)</td>
              <td className="py-1 text-right">{volume !== null && volume !== undefined ? volume.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '--'}</td>
            </tr>
            <tr>
              <td className="py-1">Минимум</td>
              <td className="py-1 text-right">{min !== null ? min.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</td>
            </tr>
            <tr>
              <td className="py-1">Максимум</td>
              <td className="py-1 text-right">{max !== null ? max.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</td>
            </tr>
            <tr>
              <td className="py-1">Среднее</td>
              <td className="py-1 text-right">{avg !== null ? avg.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</td>
            </tr>
            <tr>
              <td className="py-1">Мин. за 5 мин</td>
              <td className="py-1 text-right">{min5 !== null ? min5.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</td>
            </tr>
            <tr>
              <td className="py-1">Макс. за 5 мин</td>
              <td className="py-1 text-right">{max5 !== null ? max5.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</td>
            </tr>
            <tr>
              <td className="py-1">Мин. за 15 мин</td>
              <td className="py-1 text-right">{min15 !== null ? min15.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</td>
            </tr>
            <tr>
              <td className="py-1">Макс. за 15 мин</td>
              <td className="py-1 text-right">{max15 !== null ? max15.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

