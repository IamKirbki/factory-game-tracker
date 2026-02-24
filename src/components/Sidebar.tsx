import { Database, ChevronLeft, Box, Plus } from "lucide-react";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void; // New prop for your custom function
  onDragStart: (e: React.DragEvent, type: string) => void;
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
}: SidebarProps) {
  return (
    <aside
      className={`border-r border-slate-800 bg-slate-900 flex flex-col z-20 transition-all duration-300 ease-in-out overflow-hidden ${visible ? "w-64" : "w-0"}`}
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

      <div className="p-4 space-y-4 flex-1 overflow-y-auto min-w-[256px]">
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition-all shadow-lg shadow-blue-900/20 cursor-pointer active:scale-95"
        >
          <Plus size={14} /> CREATE NEW ASSET
        </button>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Templates
            </p>
            <div className="space-y-2">
              {MACHINE_TEMPLATES.map((m) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[10px] text-slate-600 font-mono text-center min-w-[256px]">
        DRAG & DROP TO CANVAS
      </div>
    </aside>
  );
}
