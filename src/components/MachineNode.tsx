import { Handle, Position, NodeProps } from "@xyflow/react";
import { Factory, Zap, Timer } from "lucide-react";
import { AppNode } from "../types/factory";

export function MachineNode({ data, selected }: NodeProps<AppNode>) {
  const statusStyles = {
    optimal: "border-green-500 shadow-green-900/20",
    bottleneck: "animate-bottleneck border-red-500 shadow-red-900/20",
    idle: "border-slate-700",
  };

  return (
    <div
      className={`px-4 py-3 shadow-xl rounded-lg bg-slate-900 border-2 text-white min-w-45 transition-colors ${selected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950" : ""} ${statusStyles[data.status]}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400"
      />
      <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
        <Factory size={16} className="text-blue-400" />
        <span className="font-bold text-sm uppercase tracking-wider">
          {data.label}
        </span>
      </div>
      <div className="space-y-1.5 text-[11px] text-slate-400">
        <div className="flex justify-between">
          <span className="flex items-center gap-1">
            <Timer size={12} /> Speed
          </span>
          <span className="text-slate-200">{data.speed}x</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-1">
            <Zap size={12} /> Power
          </span>
          <span className="text-slate-200">{data.energy}MW</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-400"
      />
    </div>
  );
}
