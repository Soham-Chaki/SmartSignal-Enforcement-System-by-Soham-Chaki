
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Activity, Car, TrafficCone, AlertTriangle, Play, RefreshCw, Layers, MapPin, FileText } from 'lucide-react';
import CameraFeed from './components/CameraFeed';
import ViolationTable from './components/ViolationTable';
import { SignalState, Violation, Vehicle } from './types';
import { generateViolationReport } from './services/geminiService';

const App: React.FC = () => {
  const [signal, setSignal] = useState<SignalState>(SignalState.GREEN);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [activeDetections, setActiveDetections] = useState<Record<number, string>>({});
  const [location, setLocation] = useState<string>("18.5204° N, 73.8567° E (Pune Junction)");
  
  const simulationIntervalRef = useRef<number | null>(null);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [msg, ...prev].slice(0, 15));
  };

  // Signal Controller
  useEffect(() => {
    const timer = setInterval(() => {
      setSignal(prev => {
        if (prev === SignalState.GREEN) return SignalState.YELLOW;
        if (prev === SignalState.YELLOW) return SignalState.RED;
        return SignalState.GREEN;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Fetch location for realistic data
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
      });
    }
  }, []);

  const triggerSimulation = useCallback(async () => {
    if (signal !== SignalState.RED) {
      addLog("AI AGENT: Idle. Waiting for RED signal...");
      return;
    }

    const vehicleId = Math.random().toString(36).substr(2, 9);
    const mockVehicle: Vehicle = {
      id: vehicleId,
      plate: `MH 12 ${['TX', 'BJ', 'KP'][Math.floor(Math.random()*3)]} ${Math.floor(1000 + Math.random()*9000)}`,
      type: (['SUV', 'Sedan', 'Truck', 'Motorcycle'] as any)[Math.floor(Math.random()*4)],
      color: (['Silver', 'Black', 'White', 'Blue', 'Red'] as any)[Math.floor(Math.random()*5)],
    };

    // Step 3 & 4: Detect vehicle crossing at Pole 1 and Extract Identity
    addLog(`POLE 1 (Stop Line): CROSS DETECTED. Signal: RED`);
    addLog(`POLE 1: Extracting Identity [ANPR: ${mockVehicle.plate} | Type: ${mockVehicle.type} | Color: ${mockVehicle.color}]`);
    setActiveDetections(prev => ({ ...prev, 1: mockVehicle.plate }));
    
    const pole1Time = Date.now();
    
    // Step 6 & 7: Monitor Pole 2 and match using re-identification
    setTimeout(async () => {
      addLog(`POLE 2 (Confirmation): Scanning for re-identification match for ${mockVehicle.plate}...`);
      setActiveDetections(prev => ({ ...prev, 2: mockVehicle.plate }));
      
      const pole2Time = Date.now();
      
      // Step 8: Violation Confirmed
      const newViolation: Violation = {
        id: Math.random().toString(36).substr(2, 9),
        vehicle: mockVehicle,
        startTime: pole1Time,
        endTime: pole2Time,
        status: 'PENDING',
        pole1Evidence: `https://picsum.photos/seed/${vehicleId}1/400/225`,
        pole2Evidence: `https://picsum.photos/seed/${vehicleId}2/400/225`,
      };

      setViolations(prev => [newViolation, ...prev]);
      addLog(`RE-ID SUCCESS: Confirmation complete for ${mockVehicle.plate}. VIOLATION CONFIRMED.`);

      // Final processing with Gemini for automatic challan generation
      const report = await generateViolationReport(newViolation);
      setViolations(prev => prev.map(v => 
        v.id === newViolation.id 
          ? { ...v, status: 'CONFIRMED', aiJustification: report } 
          : v
      ));
      addLog(`AI AGENT: Challan generated and evidence archived.`);

      // Reset activity UI
      setTimeout(() => {
         setActiveDetections({});
      }, 2000);

    }, 1500 + Math.random() * 1000);

  }, [signal]);

  const toggleAutoSim = () => {
    if (isSimulating) {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      setIsSimulating(false);
      addLog("System: Autonomous monitoring paused.");
    } else {
      setIsSimulating(true);
      addLog("System: Autonomous AI Agent activated.");
      simulationIntervalRef.current = window.setInterval(() => {
        if (Math.random() > 0.6) {
          triggerSimulation();
        }
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200">
      {/* Navbar */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <Shield className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">SmartSignal</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mt-1">
              By Soham Chaki • Enforcement System
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end gap-1 text-right">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
               <MapPin size={12} className="text-red-400" />
               <span>{location}</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
               <Activity size={12} className="animate-pulse" />
               <span>AI AGENT: SCANNING JUNCTION</span>
             </div>
          </div>
          <button 
            onClick={toggleAutoSim}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all transform active:scale-95 ${
              isSimulating ? 'bg-red-600 hover:bg-red-700 shadow-red-900/40' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/40'
            } shadow-lg`}
          >
            {isSimulating ? <RefreshCw className="animate-spin-slow" size={18} /> : <Play size={18} />}
            {isSimulating ? 'HALT SYSTEM' : 'ACTIVATE AI AGENT'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Feeds & Real-time Status */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CameraFeed 
              pole={1} 
              name="Pole 1: Stop Line Camera" 
              isActive={!!activeDetections[1]} 
              signal={signal}
              lastDetection={activeDetections[1]}
            />
            <CameraFeed 
              pole={2} 
              name="Pole 2: Confirmation Camera" 
              isActive={!!activeDetections[2]} 
              signal={signal}
              lastDetection={activeDetections[2]}
            />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/50 px-5 py-3 flex items-center justify-between border-b border-slate-700">
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-300">
                <Layers className="text-indigo-400" size={18} />
                Validated Violation Archive
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">COUNT: {violations.length}</span>
            </div>
            <ViolationTable 
              violations={violations} 
              onSelect={setSelectedViolation}
              selectedId={selectedViolation?.id}
            />
          </div>
        </div>

        {/* Right Column: AI Analysis & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Signal Control Panel */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl bg-gradient-to-br from-slate-900 to-slate-950">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Signal Interface</h3>
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${signal === SignalState.RED ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                 STATE: {signal}
               </span>
             </div>
             <div className="flex gap-4">
               <button 
                onClick={() => setSignal(SignalState.RED)}
                className={`flex-1 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${signal === SignalState.RED ? 'bg-red-600/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800 text-slate-700 hover:border-slate-700'}`}>
                 <div className={`w-3 h-3 rounded-full mr-2 ${signal === SignalState.RED ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                 RED
               </button>
               <button 
                onClick={() => setSignal(SignalState.GREEN)}
                className={`flex-1 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${signal === SignalState.GREEN ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-800 text-slate-700 hover:border-slate-700'}`}>
                 <div className={`w-3 h-3 rounded-full mr-2 ${signal === SignalState.GREEN ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                 GREEN
               </button>
             </div>
             <button 
                onClick={triggerSimulation}
                disabled={signal !== SignalState.RED}
                className="w-full mt-4 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg group">
                 <Car size={16} className="group-hover:translate-x-1 transition-transform" />
                 MANUAL VIOLATION TRIGGER
             </button>
          </div>

          {/* AI Evidence Dossier */}
          {selectedViolation ? (
            <div className="flex-1 bg-slate-900 border border-indigo-900/30 rounded-2xl flex flex-col shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 border-b border-slate-800 bg-indigo-900/10 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 uppercase tracking-tight">
                  <FileText size={18} /> Violation Dossier
                </h3>
                <span className="text-[10px] font-mono text-slate-500">ID: {selectedViolation.id.toUpperCase()}</span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Registration</p>
                    <p className="mono text-base font-bold text-indigo-300">{selectedViolation.vehicle.plate}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Vehicle Classification</p>
                    <p className="text-xs text-slate-200 font-semibold">{selectedViolation.vehicle.color} • {selectedViolation.vehicle.type}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Re-Identification Evidence</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative rounded-lg overflow-hidden border border-slate-800">
                      <img src={selectedViolation.pole1Evidence} className="w-full h-auto grayscale-[0.2]" alt="Pole 1" />
                      <div className="absolute top-2 left-2 bg-indigo-600 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg">POLE 1: STOP LINE</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-slate-800">
                      <img src={selectedViolation.pole2Evidence} className="w-full h-auto grayscale-[0.2]" alt="Pole 2" />
                      <div className="absolute top-2 left-2 bg-indigo-600 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg">POLE 2: CONFIRM</div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                    <p className="text-[9px] text-indigo-400 uppercase font-black tracking-widest">AI Agent Reasoning Engine</p>
                  </div>
                  {selectedViolation.status === 'PENDING' ? (
                    <div className="flex items-center gap-3 text-sm text-slate-500 italic">
                      <RefreshCw size={14} className="animate-spin" /> Correlating temporal data...
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                      {selectedViolation.aiJustification}
                    </p>
                  )}
                </div>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Location Timestamp</p>
                    <p className="text-[10px] text-slate-400 font-mono">{location} • {new Date(selectedViolation.startTime).toLocaleTimeString()}</p>
                  </div>
                  <AlertTriangle className="text-amber-500 opacity-50" size={16} />
                </div>
              </div>
              
              <div className="p-4 bg-slate-950/50 rounded-b-2xl">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition-all uppercase tracking-widest shadow-[0_4px_15px_rgba(79,70,229,0.3)] active:transform active:scale-95">
                  Generate Automated Challan
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 p-8 text-center bg-slate-900/20">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                <TrafficCone size={32} className="opacity-20" />
              </div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Awaiting Selection</h4>
              <p className="text-xs font-medium leading-relaxed max-w-[200px]">Select a confirmed violation to view the AI evidence dossier and legal justification.</p>
            </div>
          )}

          {/* System Logs */}
          <div className="h-44 bg-black/40 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col shadow-inner">
             <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Diagnostic Event Stream</span>
               <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                 <div className="w-1 h-1 rounded-full bg-indigo-500/50"></div>
                 <div className="w-1 h-1 rounded-full bg-indigo-500/20"></div>
               </div>
             </div>
             <div className="flex-1 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-1.5 scrollbar-hide">
                {systemLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 leading-tight">
                    <span className="text-indigo-900 font-bold opacity-50">&gt;</span>
                    <span className={`${log.includes('CONFIRMED') ? 'text-indigo-400 font-bold' : log.includes('RED') ? 'text-red-400' : ''}`}>{log}</span>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </main>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default App;
