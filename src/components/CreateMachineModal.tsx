import React, { useState, useRef } from "react";
import { X, Upload, Trash2, Zap } from "lucide-react";

interface CreateMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    multiplier: number;
    image: File | null;
  }) => void;
}

export function CreateMachineModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateMachineModalProps) {
  const [name, setName] = useState("");
  const [multiplier, setMultiplier] = useState(1.0);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, multiplier, image });
    // Reset form
    setName("");
    setMultiplier(1.0);
    removeImage();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Zap size={18} className="text-blue-500" /> CREATE NEW ASSET
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Machine Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Super Smelter"
              /* Added placeholder styling here */
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white 
               placeholder:text-slate-600 placeholder:italic placeholder:text-sm
               focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Multiplier Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Crafting Speed Multiplier
            </label>
            <div className="relative">
              <input
                required
                type="number"
                step="0.1"
                min="0.1"
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                placeholder="1.0"
                /* Added placeholder styling here */
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white 
                 placeholder:text-slate-600 placeholder:italic
                 focus:outline-none focus:border-blue-500 transition-colors pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs font-bold pointer-events-none">
                x
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Machine Icon
            </label>
            <div
              onClick={() => !preview && fileInputRef.current?.click()}
              className={`relative h-32 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                preview
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-800 bg-slate-950 hover:border-blue-500 cursor-pointer group"
              }`}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload
                    size={24}
                    className="text-slate-600 group-hover:text-blue-400 mb-2 transition-colors"
                  />
                  <span className="text-xs text-slate-500">
                    Click to upload image
                  </span>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-[2] p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
            >
              CREATE MACHINE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
