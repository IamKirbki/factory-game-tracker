import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  Settings2,
  Search,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Package,
  ZapOff,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
}

interface RecipeItem {
  item_id: string;
  amount: number;
}

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAddItem: () => void;
  initialMachineId?: string;
  refreshKey?: number;
}

export function CreateRecipeModal({
  isOpen,
  onClose,
  onQuickAddItem,
  initialMachineId,
  refreshKey = 0,
}: CreateRecipeModalProps) {
  const [step, setStep] = useState(1);
  const [globalItems, setGlobalItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    machine_id: "",
    craft_time_seconds: 1.0,
    inputs: [] as RecipeItem[],
    outputs: [] as RecipeItem[],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          console.log("Setting initial machine ID:", initialMachineId);
          const itemsRes = await fetch("http://localhost:3001/api/items");
          setGlobalItems(await itemsRes.json());
          if (initialMachineId) {
            setFormData((prev) => ({ ...prev, machine_id: initialMachineId }));
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [isOpen, initialMachineId, refreshKey]);

  const filteredGlobalItems = useMemo(() => {
    if (!searchQuery) return [];
    return globalItems
      .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [globalItems, searchQuery]);

  const addItemToRecipe = (item: Item) => {
    const type = step === 1 ? "inputs" : "outputs";
    if (formData[type].find((i) => i.item_id === item.id)) return;
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { item_id: item.id, amount: 1 }],
    }));
    setSearchQuery("");
  };

  const updateAmount = (
    type: "inputs" | "outputs",
    id: string,
    amount: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((i) => (i.item_id === id ? { ...i, amount } : i)),
    }));
  };

  const removeRow = (type: "inputs" | "outputs", id: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((i) => i.item_id !== id),
    }));
  };

  const getItemName = (id: string) =>
    globalItems.find((i) => i.id === id)?.name || "Unknown Item";
  const getRate = (amount: number) =>
    (amount / (formData.craft_time_seconds || 1)).toFixed(2);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: `recipe_${formData.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
      };
      const res = await fetch("http://localhost:3001/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setFormData({
          name: "",
          machine_id: "",
          craft_time_seconds: 1.0,
          inputs: [],
          outputs: [],
        });
        setStep(1);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl md:w-[35vw] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 text-orange-500">
            <Settings2 size={22} />
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
              Recipe Wizard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white cursor-pointer transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex px-12 py-5 justify-between bg-slate-950 border-b border-slate-800">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${step >= s ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-600"}`}
              >
                {s}
              </div>
              <span
                className={`text-xs font-black uppercase tracking-[0.2em] ${step >= s ? "text-slate-200" : "text-slate-600"}`}
              >
                {s === 1 ? "Inputs" : s === 2 ? "Outputs" : "Finalize"}
              </span>
            </div>
          ))}
        </div>

        <div className="p-8 flex-1 min-h-120">
          {step < 3 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {step === 1
                    ? "Step 1: Raw Ingredients"
                    : "Step 2: Produced Goods"}
                </h3>
                {step === 1 && (
                  <span className="text-[10px] text-slate-500 font-bold border border-slate-800 px-2 py-1 rounded uppercase tracking-widest">
                    Optional
                  </span>
                )}
              </div>

              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-5 top-4 text-slate-500"
                />
                <input
                  className="w-full bg-slate-950 border border-slate-800 p-4 pl-14 text-base text-slate-200 outline-none focus:border-orange-600 rounded-xl transition-all"
                  placeholder={`Search for ${step === 1 ? "inputs" : "outputs"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                    {filteredGlobalItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addItemToRecipe(item)}
                        className="w-full text-left p-5 text-sm text-slate-300 hover:bg-orange-600 hover:text-white flex items-center justify-between border-b border-slate-700 last:border-0 transition-colors"
                      >
                        <span className="font-black uppercase tracking-wider">
                          {item.name}
                        </span>{" "}
                        <PlusCircle size={20} />
                      </button>
                    ))}
                    <button
                      onClick={onQuickAddItem}
                      className="w-full text-left p-5 text-sm bg-slate-900 text-orange-500 hover:bg-slate-700 flex items-center gap-3 font-black border-t border-slate-700"
                    >
                      <Plus size={22} /> CREATE NEW ITEM
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-70 overflow-y-auto pr-2 custom-scrollbar">
                {(step === 1 ? formData.inputs : formData.outputs).map(
                  (row) => (
                    <div
                      key={row.item_id}
                      className="flex items-center gap-6 bg-slate-800 border border-slate-700 p-5 rounded-2xl border-l-8 border-l-orange-600 transition-all hover:bg-slate-800/80"
                    >
                      <span className="flex-1 text-base text-slate-100 font-black uppercase tracking-wide">
                        {getItemName(row.item_id)}
                      </span>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-black text-slate-600 uppercase">
                          Qty
                        </span>
                        <input
                          type="number"
                          className="w-16 text-base text-center text-orange-500 font-black bg-transparent outline-none"
                          value={row.amount}
                          onChange={(e) =>
                            updateAmount(
                              step === 1 ? "inputs" : "outputs",
                              row.item_id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <button
                        onClick={() =>
                          removeRow(
                            step === 1 ? "inputs" : "outputs",
                            row.item_id,
                          )
                        }
                        className="text-slate-600 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  ),
                )}

                {(step === 1 ? formData.inputs : formData.outputs).length ===
                  0 && (
                  <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                    <Package
                      size={32}
                      className="mx-auto text-slate-800 mb-3"
                    />
                    <p className="text-sm text-slate-600 font-medium italic">
                      {step === 1
                        ? "No ingredients required."
                        : "No outputs defined yet."}
                    </p>
                    <p className="text-[10px] text-slate-700 uppercase mt-1">
                      {step === 1
                        ? "You can proceed or add items using search above."
                        : "Search to add at least one product."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Step 3: Factory Integration
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Recipe Designation
                  </label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-base text-slate-200 outline-none focus:border-orange-600 transition-all"
                    placeholder="e.g. Iron Ore Extraction"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Cycle Period (Seconds)
                  </label>
                  <div className="relative">
                    <Clock
                      size={20}
                      className="absolute left-4 top-4 text-slate-600"
                    />
                    <input
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-14 text-base text-slate-200 outline-none focus:border-orange-600 transition-all"
                      value={formData.craft_time_seconds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          craft_time_seconds: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* FLOW SUMMARY */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <TrendingUp size={18} className="text-orange-600" />{" "}
                    Throughput Metrics
                  </span>
                  <span className="px-3 py-1 bg-slate-900 rounded-md text-[10px] font-mono text-orange-500 border border-orange-900/30 font-bold uppercase">
                    Rate Calculated @ {formData.craft_time_seconds}s
                  </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    {formData.inputs.map((i) => (
                      <div
                        key={i.item_id}
                        className="text-xs bg-slate-900 border border-slate-800 p-3 rounded-lg flex justify-between items-center group"
                      >
                        <span className="text-slate-400 font-bold uppercase tracking-wider">
                          {getItemName(i.item_id)}
                        </span>
                        <span className="text-red-500 font-black text-sm">
                          -{getRate(i.amount)}/s
                        </span>
                      </div>
                    ))}
                    {formData.inputs.length === 0 && (
                      <div className="flex items-center gap-2 text-slate-600 p-3 bg-slate-900/40 rounded-lg">
                        <ZapOff size={14} />
                        <span className="text-[10px] font-black uppercase">
                          Passive Generation
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-slate-800 rounded-full text-slate-600">
                    <ArrowRight size={20} />
                  </div>

                  <div className="flex-1 space-y-3">
                    {formData.outputs.map((o) => (
                      <div
                        key={o.item_id}
                        className="text-xs bg-slate-900 border border-slate-800 p-3 rounded-lg flex justify-between items-center group"
                      >
                        <span className="text-slate-400 font-bold uppercase tracking-wider">
                          {getItemName(o.item_id)}
                        </span>
                        <span className="text-green-500 font-black text-sm">
                          +{getRate(o.amount)}/s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-between px-10">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            className={`flex items-center gap-3 text-sm font-black transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "text-slate-500 hover:text-slate-200 cursor-pointer uppercase tracking-widest"}`}
          >
            <ChevronLeft size={20} /> Back
          </button>

          <div className="flex gap-6">
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 2 && formData.outputs.length === 0} // Step 1 is now always enabled
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-20 text-white px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
              >
                {step === 1 && formData.inputs.length === 0
                  ? "Skip Ingredients"
                  : "Continue"}
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-12 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Save size={20} />{" "}
                {isSubmitting ? "Syncing..." : "Finalize Recipe"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
