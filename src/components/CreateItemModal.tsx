import React, { useState } from "react";
import { X, Package, Save } from "lucide-react";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: (item: { id: string; name: string; value: number }) => void;
}

export function CreateItemModal({
  isOpen,
  onClose,
  onItemCreated,
}: CreateItemModalProps) {
  const [name, setName] = useState("");
  const [value, setValue] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const newItem = {
      id: name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      name: name.trim(),
      value: value,
    };

    try {
      const response = await fetch("http://localhost:3001/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        onItemCreated?.(newItem);
        setName("");
        setValue(0);
        onClose();
      }
    } catch (error) {
      console.error("Failed to create item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-white">
              Create New Item
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Item Name
            </label>
            <input
              autoFocus
              required
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Iron Ore, Copper Ingot..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Base Value (Credits/Cost)
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                step="0.01"
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-2.5 text-slate-500 text-sm">
                $
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 italic">
              Used for calculating total factory efficiency and resource worth.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all shadow-lg shadow-orange-900/20"
            >
              <Save size={18} />
              {isSubmitting ? "Saving..." : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
