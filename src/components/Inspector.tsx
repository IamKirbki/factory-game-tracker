import { ChevronRight, Trash2, Copy, Settings, Check } from "lucide-react";
import { AppNode, MachineData } from "../types/factory";

interface InspectorProps {
  visible: boolean;
  selectedNode: AppNode | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdateNode: (id: string, data: Partial<MachineData>) => void;
}

const RECIPES = [
  { name: "Iron Ingot", speed: 1.0, energy: 4 },
  { name: "Copper Ingot", speed: 1.0, energy: 4 },
  { name: "Iron Plate", speed: 0.5, energy: 6 },
  { name: "Iron Rod", speed: 1.0, energy: 5 },
  { name: "Screw", speed: 2.0, energy: 7 },
];

export function Inspector({
  visible,
  selectedNode,
  onClose,
  onDelete,
  onUpdateNode,
}: InspectorProps) {
  const handleRecipeSelect = (
    recipeName: string,
    speed: number,
    energy: number,
  ) => {
    if (!selectedNode) return;
    onUpdateNode(selectedNode.id, {
      recipe: recipeName,
      speed: speed,
      energy: energy,
      status: "optimal",
    });
  };

  const isRecipeEmpty =
    !selectedNode ||
    selectedNode.data.recipe === "Idle" ||
    selectedNode.data.recipe === "No Recipe Selected";

  return (
    <aside
      className={`border-l border-slate-800 bg-slate-900 z-20 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${visible ? "w-72" : "w-0"}`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between font-bold text-white text-sm min-w-[288px]">
        <button
          onClick={onClose}
          className="hover:text-orange-400 cursor-pointer p-1"
        >
          <ChevronRight size={16} />
        </button>
        <span className="text-[10px] tracking-widest text-slate-500">
          MACHINE CONFIG
        </span>
        <button className="hover:text-orange-400 cursor-pointer p-1">
          <Settings size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-w-[288px]">
        {selectedNode ? (
          <div className="p-6 space-y-6 text-sm">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                <span>Recipe</span>
                {!isRecipeEmpty && (
                  <span className="text-blue-500">Active</span>
                )}
              </label>

              {isRecipeEmpty ? (
                <div className="space-y-2">
                  {RECIPES.map((r) => (
                    <button
                      key={r.name}
                      onClick={() =>
                        handleRecipeSelect(r.name, r.speed, r.energy)
                      }
                      className="w-full text-left p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700/50 transition-all group flex justify-between items-center cursor-pointer"
                    >
                      <span>{r.name}</span>
                      <Check
                        size={14}
                        className="text-blue-500 opacity-0 group-hover:opacity-100"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
                    <span className="text-blue-400 font-bold">
                      {selectedNode.data.recipe}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateNode(selectedNode.id, { recipe: "Idle" })
                      }
                      className="text-[10px] text-blue-500 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">
                        Speed
                      </p>
                      <p className="font-bold text-white">
                        {selectedNode.data.speed}x
                      </p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">
                        Power
                      </p>
                      <p className="font-bold text-white">
                        {selectedNode.data.energy}MW
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 p-10 text-center italic">
            <Copy size={32} className="mx-auto mb-4 opacity-10" />
            Select a machine to configure its recipe
          </div>
        )}
      </div>

      {selectedNode && (
        <div className="space-y-3 p-4">
          <div className="w-full flex items-center justify-end">
            <div className="flex justify-between items-center">
              <button
                onClick={() => onDelete(selectedNode.id)}
                className="text-slate-500 hover:text-red-500 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
