import { Model } from "@iamkirbki/database-handler-core";
import Recipe, { RecipeProps } from "../models/Recipe";
import Controller from "./Controller";
import { RecipeIOProps } from "../models/RecipeInput";
import RecipeInputController from "./RecipeInputController";
import { v4 as uuidv4 } from "uuid";
import RecipeOutputController from "./RecipeOutputController";

export type createRecipeProps = {
    id: string;
    name: string;
    machine_id: string;
    craft_time_seconds: number;
    inputs: RecipeIOProps[];
    outputs: RecipeIOProps[];
}

export default class RecipeController extends Controller<RecipeProps> {
    index(): Promise<Model<RecipeProps>[]> {
        const recipe = new Recipe();
        recipe.with("RecipeInputs").with('RecipeOutputs');
        return recipe.all();
    }

    async show(machineId: string | number): Promise<Model<RecipeProps>[]> {
        const recipe = new Recipe();
        recipe.with("RecipeInputs").with('RecipeOutputs');
        const recipes = await recipe.where({ machine_id: machineId }).all();
        let res = recipes.map(r => r.values);
        res = this.dedupeRecipes(res);
        console.log(res);
        return res;
    }

    edit(value: string | number): Promise<Model<RecipeProps>> {
        throw new Error("Method not implemented.");
    }

    update(id: string | number, newValues: RecipeProps): Promise<Model<RecipeProps>> {
        throw new Error("Method not implemented.");
    }

    async create(data: createRecipeProps): Promise<Model<RecipeProps>> {
        console.log(data);
        const recipe = await Recipe.set({
            id: uuidv4(),
            name: data.name,
            machine_id: data.machine_id,
            craft_time_seconds: data.craft_time_seconds,
        }).save();

        if (!recipe?.values?.id) {
            throw new Error("Failed to create recipe");
        }

        data.inputs.forEach(input => {
            RecipeInputController.create({
                ...input,
                recipe_id: recipe.values.id!,
            });
        });

        data.outputs.forEach(output => {
            RecipeOutputController.create({
                ...output,
                recipe_id: recipe.values.id!,
            });
        });

        return recipe;
    }

    delete(id: string | number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


    dedupeRecipes(recipes: any[]) {
        const map = new Map<string, any>();

        for (const recipe of recipes) {
            const existing = map.get(recipe.id);

            if (!existing) {
                // clone to avoid reference madness
                map.set(recipe.id, {
                    ...recipe,
                    recipe_inputs: [recipe.recipe_inputs],
                    recipe_outputs: [recipe.recipe_outputs],
                });
                continue;
            }

            // Merge inputs
            if (recipe.recipe_inputs) {
                existing.recipe_inputs.push(recipe.recipe_inputs);
            }

            // Merge outputs
            if (recipe.recipe_outputs) {
                existing.recipe_outputs.push(recipe.recipe_outputs);
            }
        }

        return Array.from(map.values());
    }
}