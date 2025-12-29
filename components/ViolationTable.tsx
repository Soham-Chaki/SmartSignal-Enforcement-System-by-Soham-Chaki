
import React from 'react';
import { Violation } from '../types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ViolationTableProps {
  violations: Violation[];
  onSelect: (v: Violation) => void;
  selectedId?: string;
}

const ViolationTable: React.FC<ViolationTableProps> = ({ violations, onSelect, selectedId }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-medium">
          <tr>
            <th className="p-4 border-b border-slate-700">Vehicle ID</th>
            <th className="p-4 border-b border-slate-700">Type</th>
            <th className="p-4 border-b border-slate-700">Time</th>
            <th className="p-4 border-b border-slate-700">Status</th>
            <th className="p-4 border-b border-slate-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {violations.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                No violations detected in current session.
              </td>
            </tr>
          ) : (
            violations.map((v) => (
              <tr 
                key={v.id} 
                className={`group border-b border-slate-800 hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedId === v.id ? 'bg-slate-800/50' : ''}`}
                onClick={() => onSelect(v)}
              >
                <td className="p-4">
                  <span className="mono text-blue-400 font-bold">{v.vehicle.plate}</span>
                </td>
                <td className="p-4">
                  <span className="text-slate-300 text-sm">{v.vehicle.color} {v.vehicle.type}</span>
                </td>
                <td className="p-4">
                  <span className="text-slate-400 text-xs">{new Date(v.startTime).toLocaleTimeString()}</span>
                </td>
                <td className="p-4">
                  {v.status === 'CONFIRMED' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50">
                      <AlertCircle size={12} /> Confirmed
                    </span>
                  )}
                  {v.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800/50">
                      <Clock size={12} className="animate-spin-slow" /> Processing
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors">
                    View Dossier
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViolationTable;
