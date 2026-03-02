import { useEffect, useMemo, useState } from "react";
import { getMachines } from "../api/MachineApi";

export interface NamedAsset {
  id: string;
  name: string;
}

const MACHINE_TEMPLATES: NamedAsset[] = [
  { id: "smelter", name: "Smelter" },
  { id: "constructor", name: "Constructor" },
  { id: "assembler", name: "Assembler" },
  { id: "manufacturer", name: "Manufacturer" },
  { id: "foundry", name: "Foundry" },
  { id: "refinery", name: "Refinery" },
];

function isNamedAsset(value: unknown): value is NamedAsset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" && typeof candidate.name === "string"
  );
}

interface UseSidebarAssetsResult {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredMachines: NamedAsset[];
  filteredItems: NamedAsset[];
}

export function useSidebarAssets(refreshKey: number): UseSidebarAssetsResult {
  const [machines, setMachines] = useState<NamedAsset[]>(MACHINE_TEMPLATES);
  const [items, setItems] = useState<NamedAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getMachines()
      .then((data) => {
        if (!Array.isArray(data)) {
          setMachines(MACHINE_TEMPLATES);
          return;
        }

        const machineTemplates = data.filter(isNamedAsset).map((machine) => ({
          id: machine.id,
          name: machine.name,
        }));

        setMachines(machineTemplates);
      })
      .catch((error) => {
        console.error("Failed to fetch machines:", error);
      });

    fetch("http://localhost:3001/api/items")
      .then((response) => response.json() as Promise<unknown>)
      .then((data) => {
        if (!Array.isArray(data)) {
          setItems([]);
          return;
        }

        setItems(data.filter(isNamedAsset));
      })
      .catch((error) => {
        console.error("Failed to fetch items:", error);
      });
  }, [refreshKey]);

  const filteredMachines = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return machines.filter((machine) =>
      machine.name.toLowerCase().includes(normalizedQuery),
    );
  }, [machines, searchQuery]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery),
    );
  }, [items, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredMachines,
    filteredItems,
  };
}