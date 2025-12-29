
import React from 'react';
import { SignalState } from '../types';

interface CameraFeedProps {
  pole: number;
  name: string;
  isActive: boolean;
  signal: SignalState;
  lastDetection?: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ pole, name, isActive, signal, lastDetection }) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden relative">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
        <span className="text-xs font-bold tracking-widest text-white drop-shadow-md">POLE {pole}: {name}</span>
      </div>
      
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
         <div className={`w-4 h-4 rounded-full ${signal === SignalState.RED ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-slate-800'}`} />
         <div className={`w-4 h-4 rounded-full ${signal === SignalState.YELLOW ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'bg-slate-800'}`} />
         <div className={`w-4 h-4 rounded-full ${signal === SignalState.GREEN ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-800'}`} />
      </div>

      <div className="aspect-video bg-black relative group">
        <img 
          src={`https://picsum.photos/seed/traffic${pole}/800/450`} 
          alt="Feed" 
          className="w-full h-full object-cover opacity-60 grayscale-[0.3]"
        />
        
        {isActive && (
          <div className="absolute inset-0 border-2 border-red-500/50 flex items-center justify-center">
            <div className="text-red-500 font-bold text-sm bg-black/50 px-3 py-1 rounded">SCANNING FOR VIOLATIONS</div>
          </div>
        )}

        {lastDetection && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 p-2 rounded border border-slate-700 backdrop-blur-sm">
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Last Vehicle Match</p>
            <p className="text-sm font-mono text-emerald-400">{lastDetection}</p>
          </div>
        )}

        {/* Overlay scanning lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-full h-[1px] bg-cyan-400 absolute top-0 left-0 animate-[scan_3s_linear_infinite]" />
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CameraFeed;
