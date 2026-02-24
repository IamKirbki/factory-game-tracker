import { Database, ChevronLeft, Box, Plus, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getMachines } from "../api/MachineApi";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
  onDragStart: (e: React.DragEvent, type: string) => void;
  refreshKey?: number;
}

const MACHINE_TEMPLATES = [
  { id: "smelter", name: "Smelter" },
  { id: "constructor", name: "Constructor" },
  { id: "assembler", name: "Assembler" },
  { id: "manufacturer", name: "Manufacturer" },
  { id: "foundry", name: "Foundry" },
  { id: "refinery", name: "Refinery" },
];

export function Sidebar({
  visible,
  onClose,
  onCreate,
  onDragStart,
  refreshKey = 0,
}: SidebarProps) {
  const [machines, setMachines] = useState(MACHINE_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getMachines()
      .then((data) => {
        const machineTemplates = data.map((m: { id: string; name: string }) => ({
          id: m.id,
          name: m.name,
        }));
        setMachines(machineTemplates);
      })
      .catch((err) => {
        console.error("Failed to fetch machines:", err);
      });
  }, [refreshKey]);

  const filteredMachines = useMemo(() => {
    return machines.filter((m) =>{
      console.log("Filtering machine:", m.name, "with query:", searchQuery)
      return m.name.toLowerCase().includes(searchQuery.toLowerCase())
    });
  }, [machines, searchQuery]);

  return (
    <aside
      className={`border-r border-slate-800 bg-slate-900 flex flex-col z-20 transition-all duration-300 ease-in-out overflow-hidden ${
        visible ? "w-64" : "w-0"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 font-bold text-white flex items-center justify-between text-sm min-w-[256px]">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-blue-500" /> LIBRARY
        </div>
        <button
          onClick={onClose}
          className="hover:text-blue-400 cursor-pointer transition-colors p-1"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Main Container with Custom Scrollbar */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto min-w-[256px] custom-scrollbar">
        {/* Create Button */}
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition-all shadow-lg shadow-blue-900/20 cursor-pointer active:scale-95"
        >
          <Plus size={14} /> CREATE NEW ASSET
        </button>

        {/* Search Input Field (X button removed) */}
        <div className="relative group">
          <Search 
            size={14} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" 
          />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              {searchQuery ? `Results (${filteredMachines.length})` : "Templates"}
            </p>
            
            <div className="space-y-2">
              {filteredMachines.length > 0 ? (
                filteredMachines.map((m) => (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, m.name)}
                    className="p-3 bg-slate-800 border border-slate-700 rounded-md cursor-grab active:cursor-grabbing hover:border-blue-500 transition-all flex items-center justify-between group text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Box
                        size={14}
                        className="group-hover:text-blue-400 transition-colors"
                      />
                      <span>{m.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-600 italic">No assets found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[10px] text-slate-600 font-mono text-center min-w-[256px]">
        DRAG & DROP TO CANVAS
      </div>
    </aside>
  );
}