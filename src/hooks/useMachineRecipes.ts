import { useEffect, useState } from "react";
import { getRecipes } from "../api/RecipeApi";
import { AppNode } from "../types/factory";

export interface RecipeSummary {
  name: string;
  speed: number;
  energy: number;
}

const FALLBACK_RECIPES: RecipeSummary[] = [
  { name: "Iron Ingot", speed: 1.0, energy: 4 },
  { name: "Copper Ingot", speed: 1.0, energy: 4 },
  { name: "Iron Plate", speed: 0.5, energy: 6 },
  { name: "Iron Rod", speed: 1.0, energy: 5 },
  { name: "Screw", speed: 2.0, energy: 7 },
];

function isRecipeSummary(value: unknown): value is RecipeSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.speed === "number" &&
    typeof candidate.energy === "number"
  );
}

export function useMachineRecipes(selectedNode: AppNode | null): RecipeSummary[] {
  const [recipes, setRecipes] = useState<RecipeSummary[]>(FALLBACK_RECIPES);

  useEffect(() => {
    if (!selectedNode) {
      setRecipes(FALLBACK_RECIPES);
      return;
    }

    let isMounted = true;

    getRecipes(selectedNode.data.machine_id)
      .then((response) => {
        const payload = response.data as unknown;

        if (!isMounted) {
          return;
        }

        if (!Array.isArray(payload)) {
          setRecipes(FALLBACK_RECIPES);
          return;
        }

        const mappedRecipes = payload.filter(isRecipeSummary);
        setRecipes(mappedRecipes.length > 0 ? mappedRecipes : FALLBACK_RECIPES);
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Failed to fetch recipes:", error);
          setRecipes(FALLBACK_RECIPES);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedNode]);

  return recipes;
}